/**
 * TapTap can run two ways:
 *  - "demo mode": no Supabase project needed. All reads/writes hit the
 *    in-memory seeded repository in `src/lib/data`. This is what runs out of
 *    the box after `npm install && npm run dev`.
 *  - "live mode": Supabase is configured (URL + anon key present and
 *    NEXT_PUBLIC_DEMO_MODE is not "true"). Auth, Postgres and Storage are used
 *    for real, against the schema in supabase/migrations.
 *
 * Every data-access function in `src/lib/data` branches on `isDemoMode()` so
 * the rest of the app (pages, components) never has to know which backend it's
 * talking to.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function isDemoMode(): boolean {
  const flag = process.env.NEXT_PUBLIC_DEMO_MODE;
  if (flag === 'false') return false;
  if (flag === 'true') return true;
  // Default: demo mode unless Supabase is actually configured.
  return !isSupabaseConfigured();
}
