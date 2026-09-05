import { NextResponse } from 'next/server';
import { requireApiSession, handleApiError } from '@/lib/auth/api-guard';
import { markAllNotificationsRead } from '@/lib/data/notifications';

export async function POST() {
  try {
    const session = await requireApiSession();
    await markAllNotificationsRead(session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
