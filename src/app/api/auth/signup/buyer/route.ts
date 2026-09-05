import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isDemoMode } from '@/lib/supabase/env';
import { signupBuyerSchema } from '@/lib/domain/validation';
import { signupBuyer } from '@/lib/data/auth';
import { DEMO_SESSION_COOKIE, ROLE_COOKIE } from '@/lib/auth/cookies';

const COOKIE_OPTS = { httpOnly: false, sameSite: 'lax' as const, path: '/', maxAge: 60 * 60 * 24 * 30 };

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = signupBuyerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input.' }, { status: 400 });
  }

  if (isDemoMode()) {
    try {
      const { userId } = await signupBuyer(parsed.data);
      const cookieStore = await cookies();
      cookieStore.set(DEMO_SESSION_COOKIE, userId, COOKIE_OPTS);
      cookieStore.set(ROLE_COOKIE, 'buyer', COOKIE_OPTS);
      return NextResponse.json({ ok: true, redirectTo: '/buyer/dashboard' });
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not create account.' }, { status: 400 });
    }
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email: parsed.data.email, password: parsed.data.password });
  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? 'Could not create account.' }, { status: 400 });
  }
  const userId = data.user.id;
  await supabase.from('users').insert({ id: userId, email: parsed.data.email, full_name: parsed.data.fullName, phone: parsed.data.phone, role: 'buyer' });
  const { data: biz } = await supabase
    .from('business_profiles')
    .insert({
      owner_user_id: userId,
      business_name: parsed.data.businessName,
      registration_number: parsed.data.registrationNumber,
      address: parsed.data.address,
      district: parsed.data.district,
      postcode: parsed.data.postcode,
      phone: parsed.data.phone,
    })
    .select('id')
    .single();
  await supabase.from('buyer_profiles').insert({ user_id: userId, business_profile_id: biz.id, business_type: parsed.data.businessType });

  return NextResponse.json({ ok: true, redirectTo: '/buyer/dashboard' });
}
