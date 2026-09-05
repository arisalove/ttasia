import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isDemoMode } from '@/lib/supabase/env';
import { signupSupplierSchema } from '@/lib/domain/validation';
import { signupSupplier } from '@/lib/data/auth';
import { DEMO_SESSION_COOKIE, ROLE_COOKIE } from '@/lib/auth/cookies';

const COOKIE_OPTS = { httpOnly: false, sameSite: 'lax' as const, path: '/', maxAge: 60 * 60 * 24 * 30 };

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = signupSupplierSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input.' }, { status: 400 });
  }

  if (isDemoMode()) {
    try {
      const { userId } = await signupSupplier(parsed.data);
      const cookieStore = await cookies();
      cookieStore.set(DEMO_SESSION_COOKIE, userId, COOKIE_OPTS);
      cookieStore.set(ROLE_COOKIE, 'supplier', COOKIE_OPTS);
      return NextResponse.json({ ok: true, redirectTo: '/supplier/dashboard' });
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
  await supabase.from('users').insert({ id: userId, email: parsed.data.email, full_name: parsed.data.fullName, phone: parsed.data.phone, role: 'supplier' });
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
  const slug = parsed.data.storeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  await supabase.from('supplier_profiles').insert({
    user_id: userId,
    business_profile_id: biz.id,
    store_slug: slug,
    store_name: parsed.data.storeName,
    store_description: parsed.data.storeDescription,
    supplier_type: parsed.data.supplierType,
    categories: parsed.data.categories,
    minimum_order_sen: parsed.data.minimumOrderSen,
    verification_status: 'pending',
  });

  return NextResponse.json({ ok: true, redirectTo: '/supplier/dashboard' });
}
