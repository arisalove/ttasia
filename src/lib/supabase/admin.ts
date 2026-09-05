import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client. SERVER-ONLY — the `server-only` import above
 * makes any accidental client-component import a build error. Used for the
 * seed script and privileged admin operations (e.g. approving suppliers,
 * reviewing receipts) that must bypass RLS deliberately and safely.
 *
 * Never import this from a Client Component. Never send
 * SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL are required for admin operations.');
  }
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
