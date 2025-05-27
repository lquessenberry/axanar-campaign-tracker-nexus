// Supabase client configuration with regular and admin access
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase connection details
const SUPABASE_URL = "https://vsarkftwkontkfcodbyk.supabase.co";

// Public/anon key - has RLS restrictions
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzYXJrZnR3a29udGtmY29kYnlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzgwODksImV4cCI6MjA2MzYxNDA4OX0.gc3Qq6_qXnbkDT77jBX2UZ-Q3A1g6AHR7NlhVQDzVgg";

// For security, in production, you would use environment variables rather than hardcoding
// We're hardcoding this for the demo but would typically use process.env.SUPABASE_SERVICE_KEY
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzYXJrZnR3a29udGtmY29kYnlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODAzODA4OSwiZXhwIjoyMDYzNjE0MDg5fQ.Cy1dJGd2mXZlLnSKjx-QLEkmdRnCDFLNyOVIOLbM68A";

// Regular client - subject to RLS policies
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    storageKey: 'axanar-auth-token',
    storage: {
      getItem: (key) => window.localStorage.getItem(key),
      setItem: (key, value) => window.localStorage.setItem(key, value),
      removeItem: (key) => window.localStorage.removeItem(key)
    }
  }
});

// Admin client - bypasses RLS, use only for operations that require admin privileges
export const supabaseAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false // Don't persist admin sessions
  }
});