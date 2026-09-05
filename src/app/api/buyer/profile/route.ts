import { NextResponse } from 'next/server';
import { requireApiSession, handleApiError, ApiError } from '@/lib/auth/api-guard';
import { businessProfileSchema } from '@/lib/domain/validation';
import { getBusinessProfileForUser, updateBusinessProfile } from '@/lib/data/profile';

export async function PATCH(request: Request) {
  try {
    const session = await requireApiSession('buyer');
    const body = await request.json().catch(() => null);
    const parsed = businessProfileSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? 'Invalid input.');

    const profile = await getBusinessProfileForUser(session.user.id);
    if (!profile) throw new ApiError('Business profile not found.', 404);

    await updateBusinessProfile(profile.id, parsed.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
