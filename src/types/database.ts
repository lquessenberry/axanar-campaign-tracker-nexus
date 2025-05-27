/**
 * Custom database type definitions to support tables not yet in the generated types
 * This is a temporary solution until proper database types are generated
 */
import { SupabaseClient } from '@supabase/supabase-js';

// Define a helper to safely use any table name with the Supabase client
export function safeFrom(client: SupabaseClient, table: string) {
  // This type assertion is needed because the auto-generated types don't include
  // the 'donors' table yet, but we know it exists in the actual database
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return client.from(table as any);
}

