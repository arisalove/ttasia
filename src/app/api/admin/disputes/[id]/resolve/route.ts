import { NextResponse } from 'next/server';
import { requireApiSession, handleApiError, ApiError } from '@/lib/auth/api-guard';
import { resolveDispute } from '@/lib/data/admin';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApiSession('admin');
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const status = body?.status;
    if (!['resolved', 'rejected', 'investigating'].includes(status)) throw new ApiError('Invalid status.');

    await resolveDispute(id, status, body?.resolutionNote ?? '', session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
