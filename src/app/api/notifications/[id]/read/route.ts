import { NextResponse } from 'next/server';
import { requireApiSession, handleApiError } from '@/lib/auth/api-guard';
import { markNotificationRead } from '@/lib/data/notifications';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApiSession();
    const { id } = await params;
    await markNotificationRead(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
