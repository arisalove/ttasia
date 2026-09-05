import { NextResponse } from 'next/server';
import { requireApiSession, handleApiError, ApiError } from '@/lib/auth/api-guard';
import { setUserSuspended } from '@/lib/data/admin';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApiSession('admin');
    const { id } = await params;
    const body = await request.json().catch(() => null);
    if (typeof body?.suspended !== 'boolean') throw new ApiError('suspended (boolean) is required.');

    await setUserSuspended(id, body.suspended, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
