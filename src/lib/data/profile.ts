import 'server-only';
import { isDemoMode } from '../supabase/env';
import { getState } from './demo-store';
import type { BusinessProfile } from '../domain/types';

export async function getBusinessProfileForUser(userId: string): Promise<BusinessProfile | null> {
  if (isDemoMode()) {
    return getState().businessProfiles.find((b) => b.ownerUserId === userId) ?? null;
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('business_profiles').select('*').eq('owner_user_id', userId).maybeSingle();
  return data
    ? {
        id: data.id,
        ownerUserId: data.owner_user_id,
        businessName: data.business_name,
        registrationNumber: data.registration_number,
        address: data.address,
        district: data.district,
        postcode: data.postcode ?? undefined,
        phone: data.phone,
        createdAt: data.created_at,
      }
    : null;
}

/** Maps buyerProfile.id -> business name, for supplier/admin screens that list orders by buyer. */
export async function getBuyerDisplayNames(): Promise<Record<string, string>> {
  if (isDemoMode()) {
    const state = getState();
    return Object.fromEntries(
      state.buyerProfiles.map((b) => {
        const business = state.businessProfiles.find((bp) => bp.id === b.businessProfileId);
        return [b.id, business?.businessName ?? 'Buyer'];
      }),
    );
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('buyer_profiles').select('id, business_profiles(business_name)');
  return Object.fromEntries(
    (data ?? []).map((row) => {
      const business = Array.isArray(row.business_profiles) ? row.business_profiles[0] : row.business_profiles;
      return [row.id, (business as { business_name?: string } | null)?.business_name ?? 'Buyer'];
    }),
  );
}

export async function updateBusinessProfile(
  businessProfileId: string,
  patch: Partial<Pick<BusinessProfile, 'businessName' | 'address' | 'district' | 'postcode' | 'phone'>>,
): Promise<void> {
  if (isDemoMode()) {
    const profile = getState().businessProfiles.find((b) => b.id === businessProfileId);
    if (profile) Object.assign(profile, patch);
    return;
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  await supabase
    .from('business_profiles')
    .update({
      business_name: patch.businessName,
      address: patch.address,
      district: patch.district,
      postcode: patch.postcode,
      phone: patch.phone,
    })
    .eq('id', businessProfileId);
}
