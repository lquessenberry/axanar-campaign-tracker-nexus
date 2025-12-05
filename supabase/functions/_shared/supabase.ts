// Shared Supabase client initialization for edge functions

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

/**
 * Create a Supabase client with service role (bypasses RLS)
 * Use for admin operations and background jobs
 */
export function createServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Create a Supabase client with user context from Authorization header
 * Use for user-authenticated operations
 */
export function createUserClient(authHeader: string | null) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Verify the requesting user is an admin
 */
export async function verifyAdmin(authHeader: string | null): Promise<{ isAdmin: boolean; userId?: string; error?: string }> {
  if (!authHeader) {
    return { isAdmin: false, error: "No authorization header" };
  }

  const client = createUserClient(authHeader);
  
  const { data: { user }, error: authError } = await client.auth.getUser();
  
  if (authError || !user) {
    return { isAdmin: false, error: "Invalid authentication" };
  }

  const { data: adminData, error: adminError } = await client
    .from("admin_users")
    .select("is_super_admin, is_content_manager")
    .eq("user_id", user.id)
    .single();

  if (adminError || !adminData) {
    return { isAdmin: false, userId: user.id, error: "Not an admin" };
  }

  return { 
    isAdmin: adminData.is_super_admin || adminData.is_content_manager,
    userId: user.id,
  };
}

/**
 * Verify the requesting user is a super admin
 */
export async function verifySuperAdmin(authHeader: string | null): Promise<{ isSuperAdmin: boolean; userId?: string; error?: string }> {
  if (!authHeader) {
    return { isSuperAdmin: false, error: "No authorization header" };
  }

  const client = createUserClient(authHeader);
  
  const { data: { user }, error: authError } = await client.auth.getUser();
  
  if (authError || !user) {
    return { isSuperAdmin: false, error: "Invalid authentication" };
  }

  const { data: adminData, error: adminError } = await client
    .from("admin_users")
    .select("is_super_admin")
    .eq("user_id", user.id)
    .single();

  if (adminError || !adminData || !adminData.is_super_admin) {
    return { isSuperAdmin: false, userId: user.id, error: "Not a super admin" };
  }

  return { isSuperAdmin: true, userId: user.id };
}
