import { NextResponse } from 'next/server';
import { requireApiSession, handleApiError, ApiError } from '@/lib/auth/api-guard';
import { setCommissionPercent } from '@/lib/data/admin';

export async function POST(request: Request) {
  try {
    const session = await requireApiSession('admin');
    const body = await request.json().catch(() => null);
    const percent = Number(body?.commissionPercent);
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) throw new ApiError('Enter a commission percentage between 0 and 100.');

    await setCommissionPercent(percent, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
