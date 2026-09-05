import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isDemoMode } from '@/lib/supabase/env';
import { DEMO_SESSION_COOKIE, ROLE_COOKIE } from '@/lib/auth/cookies';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_SESSION_COOKIE);
  cookieStore.delete(ROLE_COOKIE);

  if (!isDemoMode()) {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  const url = new URL('/', request.url);
  return NextResponse.redirect(url, { status: 303 });
}
