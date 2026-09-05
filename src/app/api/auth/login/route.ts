import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isDemoMode } from '@/lib/supabase/env';
import { demoLogin } from '@/lib/data/auth';
import { DEMO_SESSION_COOKIE, ROLE_COOKIE } from '@/lib/auth/cookies';
import { dashboardPathForRole } from '@/lib/auth/session';

const COOKIE_OPTS = { httpOnly: false, sameSite: 'lax' as const, path: '/', maxAge: 60 * 60 * 24 * 30 };

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  if (isDemoMode()) {
    const result = await demoLogin(email, password);
    if (!result.ok || !result.userId || !result.role) {
      return NextResponse.json({ error: result.error ?? 'Invalid login.' }, { status: 401 });
    }
    const cookieStore = await cookies();
    cookieStore.set(DEMO_SESSION_COOKIE, result.userId, COOKIE_OPTS);
    cookieStore.set(ROLE_COOKIE, result.role, COOKIE_OPTS);
    return NextResponse.json({ ok: true, redirectTo: dashboardPathForRole(result.role) });
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? 'Invalid login.' }, { status: 401 });
  }
  const { data: profile } = await supabase.from('users').select('role').eq('id', data.user.id).single();
  const role = profile?.role ?? 'buyer';
  return NextResponse.json({ ok: true, redirectTo: dashboardPathForRole(role) });
}
