-- Fix remaining critical security issues

-- Fix 1: Drop remaining SECURITY DEFINER views
DROP VIEW IF EXISTS vw_donor_details CASCADE;
DROP VIEW IF EXISTS campaign_totals CASCADE;

-- Recreate as regular views (not SECURITY DEFINER)
CREATE OR REPLACE VIEW vw_donor_details AS
SELECT 
  d.id as donor_id,
  d.created_at as donor_created_at,
  d.updated_at as donor_updated_at,
  d.legacy_id,
  d.auth_user_id,
  d.email as donor_email,
  d.first_name,
  d.last_name,
  d.full_name,
  d.donor_name
FROM donors d;

CREATE OR REPLACE VIEW campaign_totals AS
SELECT 
    c.id as campaign_id,
    c.name as campaign_name,
    c.provider,
    c.start_date,
    c.end_date,
    c.active,
    COALESCE(SUM(p.amount), 0) as total_amount,
    COUNT(DISTINCT p.donor_id) as backers_count,
    COUNT(p.id) as total_pledges
FROM campaigns c
LEFT JOIN pledges p ON c.id = p.campaign_id
GROUP BY c.id, c.name, c.provider, c.start_date, c.end_date, c.active
ORDER BY c.created_at DESC;

-- Fix 2: Enable RLS on any remaining tables that might not have it
-- Check and enable RLS on tables that might be missing it

-- Enable RLS on the vw_donors_with_addresses if it's a materialized view table
-- (if it exists as a table rather than a view)

-- Find and enable RLS on any remaining tables without it
DO $$
DECLARE
    table_record RECORD;
BEGIN
    -- Find all tables in public schema that don't have RLS enabled
    FOR table_record IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN (
            SELECT tablename 
            FROM pg_tables t 
            JOIN pg_class c ON c.relname = t.tablename 
            WHERE c.relrowsecurity = true 
            AND t.schemaname = 'public'
        )
    LOOP
        -- Enable RLS on each table found
        EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', 
                      table_record.schemaname, table_record.tablename);
        
        RAISE NOTICE 'Enabled RLS on table: %.%', 
                     table_record.schemaname, table_record.tablename;
    END LOOP;
END $$;

-- Fix 3: Create admin-only policies for any tables that might be missing them
-- These should restrict access to admin users only

-- Ensure vw_donors_with_addresses has proper RLS policies
-- (This will create policies only if the view is actually a table)
DO $$
BEGIN
    -- Check if vw_donors_with_addresses exists as a table
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'vw_donors_with_addresses'
    ) THEN
        -- Create admin-only policy if it's a table
        DROP POLICY IF EXISTS "Only admins can access vw_donors_with_addresses" ON vw_donors_with_addresses;
        CREATE POLICY "Only admins can access vw_donors_with_addresses" 
        ON vw_donors_with_addresses FOR ALL TO authenticated 
        USING (check_current_user_is_admin());
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Ignore errors if the table doesn't exist or policies can't be created
    RAISE NOTICE 'Could not create policies for vw_donors_with_addresses: %', SQLERRM;
END $$;