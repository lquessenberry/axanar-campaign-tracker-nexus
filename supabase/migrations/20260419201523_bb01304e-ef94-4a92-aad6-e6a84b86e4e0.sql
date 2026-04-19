-- Public donors directory: aggregate counts by first letter of last name, and paginated fetch by letter

-- Helper: derive surname-initial for ordering/grouping
-- Uses last_name when present, else last token of full_name/donor_name, else email local-part initial
CREATE OR REPLACE FUNCTION public.donor_surname_initial(
  p_last_name text,
  p_full_name text,
  p_donor_name text,
  p_email text
)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT UPPER(LEFT(
    COALESCE(
      NULLIF(TRIM(p_last_name), ''),
      NULLIF(SPLIT_PART(TRIM(COALESCE(p_full_name, p_donor_name, '')), ' ',
        GREATEST(1, ARRAY_LENGTH(STRING_TO_ARRAY(TRIM(COALESCE(p_full_name, p_donor_name, '')), ' '), 1))
      ), ''),
      LEFT(COALESCE(p_email, ''), 1),
      '#'
    ), 1
  ))
$$;

-- Count donors per surname-initial bucket (donors with at least one tracked donation)
CREATE OR REPLACE FUNCTION public.get_public_donor_letter_counts()
RETURNS TABLE(letter text, donor_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH base AS (
    SELECT
      CASE
        WHEN public.donor_surname_initial(d.last_name, d.full_name, d.donor_name, d.email) ~ '^[A-Z]$'
          THEN public.donor_surname_initial(d.last_name, d.full_name, d.donor_name, d.email)
        ELSE '#'
      END AS letter
    FROM public.donors d
    JOIN public.donor_pledge_totals dpt ON dpt.donor_id = d.id
    WHERE COALESCE(d.deleted, false) = false
      AND dpt.total_donated > 0
  )
  SELECT letter, COUNT(*)::bigint AS donor_count
  FROM base
  GROUP BY letter
  ORDER BY letter;
$$;

-- Fetch donors for one letter bucket. Returns only public-safe fields.
CREATE OR REPLACE FUNCTION public.get_public_donors_by_letter(p_letter text)
RETURNS TABLE(
  display_name text,
  username text,
  has_account boolean,
  sort_key text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH base AS (
    SELECT
      d.id,
      d.username,
      d.auth_user_id,
      d.first_name,
      d.last_name,
      d.full_name,
      d.donor_name,
      d.email,
      CASE
        WHEN public.donor_surname_initial(d.last_name, d.full_name, d.donor_name, d.email) ~ '^[A-Z]$'
          THEN public.donor_surname_initial(d.last_name, d.full_name, d.donor_name, d.email)
        ELSE '#'
      END AS letter
    FROM public.donors d
    JOIN public.donor_pledge_totals dpt ON dpt.donor_id = d.id
    WHERE COALESCE(d.deleted, false) = false
      AND dpt.total_donated > 0
  )
  SELECT
    -- Display: username if registered, else best real name
    CASE
      WHEN b.auth_user_id IS NOT NULL AND NULLIF(TRIM(b.username), '') IS NOT NULL
        THEN b.username
      WHEN NULLIF(TRIM(COALESCE(b.first_name, '') || ' ' || COALESCE(b.last_name, '')), '') IS NOT NULL
        THEN TRIM(COALESCE(b.first_name, '') || ' ' || COALESCE(b.last_name, ''))
      WHEN NULLIF(TRIM(b.full_name), '') IS NOT NULL THEN b.full_name
      WHEN NULLIF(TRIM(b.donor_name), '') IS NOT NULL THEN b.donor_name
      ELSE SPLIT_PART(b.email, '@', 1)
    END AS display_name,
    CASE WHEN b.auth_user_id IS NOT NULL THEN b.username ELSE NULL END AS username,
    (b.auth_user_id IS NOT NULL) AS has_account,
    -- Sort by surname then first name (case-insensitive)
    LOWER(COALESCE(NULLIF(b.last_name, ''), b.full_name, b.donor_name, b.email)) || '|' ||
      LOWER(COALESCE(b.first_name, '')) AS sort_key
  FROM base b
  WHERE b.letter = UPPER(p_letter)
  ORDER BY sort_key
  LIMIT 5000;
$$;

-- Allow anonymous + authenticated calls
GRANT EXECUTE ON FUNCTION public.get_public_donor_letter_counts() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_donors_by_letter(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.donor_surname_initial(text, text, text, text) TO anon, authenticated;