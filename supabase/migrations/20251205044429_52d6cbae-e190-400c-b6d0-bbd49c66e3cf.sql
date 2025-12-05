-- =====================================================
-- SECURITY FIX: Add search_path to functions missing it
-- =====================================================

-- Fix is_message_to_admin
CREATE OR REPLACE FUNCTION public.is_message_to_admin(recipient_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
 SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = recipient_user_id
  );
END;
$function$;

-- Fix extract_mentions
CREATE OR REPLACE FUNCTION public.extract_mentions(text_content text)
 RETURNS text[]
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path = public
AS $function$
DECLARE
  mentions TEXT[];
BEGIN
  SELECT ARRAY_AGG(DISTINCT username)
  INTO mentions
  FROM (
    SELECT regexp_matches(text_content, '@(\w+)', 'g') AS username
  ) AS matches;
  
  RETURN COALESCE(mentions, ARRAY[]::TEXT[]);
END;
$function$;

-- Fix sanitize_text_input
CREATE OR REPLACE FUNCTION public.sanitize_text_input(input_text text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path = public
AS $function$
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  input_text := regexp_replace(input_text, '<[^>]*>', '', 'gi');
  input_text := regexp_replace(input_text, '(javascript|vbscript|onclick|onerror|onload):', '', 'gi');
  input_text := regexp_replace(input_text, 'data:text/html', '', 'gi');
  
  IF LENGTH(input_text) > 10000 THEN
    input_text := LEFT(input_text, 10000);
  END IF;
  
  RETURN input_text;
END;
$function$;

-- Fix validate_email_secure
CREATE OR REPLACE FUNCTION public.validate_email_secure(email_input text)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path = public
AS $function$
BEGIN
  IF email_input IS NULL OR LENGTH(email_input) > 254 THEN
    RETURN false;
  END IF;
  
  IF NOT email_input ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN false;
  END IF;
  
  IF email_input ~* '(script|javascript|vbscript|onclick|onerror|onload)' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$;

-- Fix generate_username_from_email
CREATE OR REPLACE FUNCTION public.generate_username_from_email(email_input text)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  base_username := LOWER(REGEXP_REPLACE(
    SPLIT_PART(email_input, '@', 1), 
    '[^a-zA-Z0-9]', '', 'g'
  ));
  
  IF LENGTH(base_username) < 3 THEN
    base_username := base_username || 'user';
  END IF;
  
  final_username := base_username;
  
  WHILE EXISTS (
    SELECT 1 FROM public.donors WHERE username = final_username
    UNION ALL
    SELECT 1 FROM public.profiles WHERE username = final_username
  ) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;
  
  RETURN final_username;
END;
$function$;

-- Fix auto_generate_donor_username
CREATE OR REPLACE FUNCTION public.auto_generate_donor_username()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  IF NEW.username IS NULL AND NEW.email IS NOT NULL THEN
    NEW.username := generate_username_from_email(NEW.email);
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix update_like_counts
CREATE OR REPLACE FUNCTION public.update_like_counts()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.thread_id IS NOT NULL THEN
      UPDATE forum_threads SET like_count = like_count + 1 WHERE id = NEW.thread_id;
    ELSIF NEW.comment_id IS NOT NULL THEN
      UPDATE forum_comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.thread_id IS NOT NULL THEN
      UPDATE forum_threads SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.thread_id;
    ELSIF OLD.comment_id IS NOT NULL THEN
      UPDATE forum_comments SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.comment_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$function$;

-- Fix update_comment_timestamp
CREATE OR REPLACE FUNCTION public.update_comment_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  NEW.is_edited = TRUE;
  RETURN NEW;
END;
$function$;

-- Fix update_thread_like_count
CREATE OR REPLACE FUNCTION public.update_thread_like_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.thread_id IS NOT NULL THEN
      UPDATE forum_threads SET like_count = like_count + 1 WHERE id = NEW.thread_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.thread_id IS NOT NULL THEN
      UPDATE forum_threads SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.thread_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Fix update_comment_like_count
CREATE OR REPLACE FUNCTION public.update_comment_like_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.comment_id IS NOT NULL THEN
      UPDATE forum_comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.comment_id IS NOT NULL THEN
      UPDATE forum_comments SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.comment_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Fix update_user_presence
CREATE OR REPLACE FUNCTION public.update_user_presence(is_online_status boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.user_presence (user_id, is_online, last_seen, updated_at)
  VALUES (auth.uid(), is_online_status, now(), now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    is_online = is_online_status,
    last_seen = now(),
    updated_at = now();
END;
$function$;

-- Fix is_admin_user
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE admin_users.user_id = $1
  );
END;
$function$;

-- Fix get_active_title_buffs
CREATE OR REPLACE FUNCTION public.get_active_title_buffs(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_buffs JSONB;
BEGIN
  SELECT jsonb_build_object(
    'xp_multiplier', COALESCE(MAX(at.xp_multiplier), 1.0),
    'forum_xp_bonus', COALESCE(SUM(at.forum_xp_bonus), 0),
    'participation_xp_bonus', COALESCE(SUM(at.participation_xp_bonus), 0),
    'special_permissions', COALESCE(jsonb_agg(DISTINCT p) FILTER (WHERE p IS NOT NULL), '[]'::jsonb)
  ) INTO v_buffs
  FROM public.user_ambassadorial_titles uat
  JOIN public.ambassadorial_titles at ON uat.title_id = at.id
  LEFT JOIN LATERAL jsonb_array_elements(at.special_permissions) p ON true
  WHERE uat.user_id = p_user_id AND uat.is_displayed = true;
  
  RETURN COALESCE(v_buffs, jsonb_build_object(
    'xp_multiplier', 1.0,
    'forum_xp_bonus', 0,
    'participation_xp_bonus', 0,
    'special_permissions', '[]'::jsonb
  ));
END;
$function$;

-- Fix find_pledge_data_issues
CREATE OR REPLACE FUNCTION public.find_pledge_data_issues(search_email text)
 RETURNS TABLE(donor_email text, donor_id uuid, pledge_id uuid, current_amount numeric, source_amount text, campaign_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    d.email::TEXT,
    d.id,
    p.id,
    p.amount,
    d.source_amount,
    c.name::TEXT
  FROM donors d
  JOIN pledges p ON d.id = p.donor_id
  JOIN campaigns c ON p.campaign_id = c.id
  WHERE LOWER(d.email) = LOWER(search_email)
    AND p.amount <= 5.00
  ORDER BY p.created_at DESC;
END;
$function$;