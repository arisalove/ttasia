import 'server-only';
import { cookies } from 'next/headers';
import { isDemoMode } from '../supabase/env';
import { getState } from '../data/demo-store';
import type { AppUser, UserRole } from '../domain/types';
import { DEMO_SESSION_COOKIE, ROLE_COOKIE } from './cookies';

export { DEMO_SESSION_COOKIE, ROLE_COOKIE };

export interface Session {
  user: AppUser;
  buyerProfileId?: string;
  supplierProfileId?: string;
}

/**
 * Resolve the current session for Server Components / Route Handlers /
 * Server Actions. In demo mode this reads a lightweight cookie set by the
 * demo login/signup actions (NOT secure auth — fine for a local MVP demo).
 * In live mode it delegates to Supabase Auth and looks up the matching
 * `public.users` row for role/profile info.
 */
export async function getSession(): Promise<Session | null> {
  if (isDemoMode()) {
    const cookieStore = await cookies();
    const userId = cookieStore.get(DEMO_SESSION_COOKIE)?.value;
    if (!userId) return null;
    const state = getState();
    const user = state.users.find((u) => u.id === userId);
    if (!user) return null;
    const buyerProfile = state.buyerProfiles.find((b) => b.userId === userId);
    const supplierProfile = state.supplierProfiles.find((s) => s.userId === userId);
    return { user, buyerProfileId: buyerProfile?.id, supplierProfileId: supplierProfile?.id };
  }

  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  const { data: profileRow } = await supabase.from('users').select('*').eq('id', authUser.id).single();
  if (!profileRow) return null;

  const user: AppUser = {
    id: profileRow.id,
    email: profileRow.email,
    phone: profileRow.phone ?? undefined,
    fullName: profileRow.full_name,
    role: profileRow.role,
    locale: profileRow.locale,
    avatarUrl: profileRow.avatar_url ?? undefined,
    createdAt: profileRow.created_at,
    suspended: profileRow.suspended,
  };

  let buyerProfileId: string | undefined;
  let supplierProfileId: string | undefined;
  if (user.role === 'buyer') {
    const { data } = await supabase.from('buyer_profiles').select('id').eq('user_id', user.id).single();
    buyerProfileId = data?.id;
  } else if (user.role === 'supplier') {
    const { data } = await supabase.from('supplier_profiles').select('id').eq('user_id', user.id).single();
    supplierProfileId = data?.id;
  }

  return { user, buyerProfileId, supplierProfileId };
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) throw new Error('UNAUTHENTICATED');
  return session;
}

export async function requireRole(role: UserRole): Promise<Session> {
  const session = await requireSession();
  if (session.user.role !== role) throw new Error('FORBIDDEN');
  return session;
}

export function dashboardPathForRole(role: UserRole): string {
  switch (role) {
    case 'buyer':
      return '/buyer/dashboard';
    case 'supplier':
      return '/supplier/dashboard';
    case 'admin':
      return '/admin/dashboard';
  }
}
