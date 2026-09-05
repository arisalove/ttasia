import { NextResponse } from 'next/server';
import { requireApiSession, handleApiError, ApiError } from '@/lib/auth/api-guard';
import { setSupplierVerification } from '@/lib/data/admin';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApiSession('admin');
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const status = body?.status;
    if (!['verified', 'rejected', 'suspended', 'pending'].includes(status)) throw new ApiError('Invalid status.');

    await setSupplierVerification(id, status, session.user.id, body?.note);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
