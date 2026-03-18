// Authenticated Supabase client that injects the x-assessor-token header on every request.
// Import this instead of the base client when you need token-based RLS to work.
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { getStoredToken } from '@/lib/auth';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Returns a Supabase client with the stored assessor token injected as a
 * custom header so that server-side RLS policies can validate it.
 */
export function getAuthedClient() {
  const token = getStoredToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['x-assessor-token'] = token;
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers,
    },
  });
}
