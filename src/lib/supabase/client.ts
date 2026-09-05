'use client';

import { createBrowserClient } from '@supabase/ssr';
import { isSupabaseConfigured } from './env';

/**
 * Browser-side Supabase client. Only call this when `isSupabaseConfigured()`
 * is true (i.e. not in demo mode) — components should branch on demo mode
 * before touching Supabase directly, and prefer the functions in
 * `src/lib/data` over calling this client ad hoc.
 */
export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY, or use demo mode.',
    );
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
