import { NextResponse } from 'next/server';
import { requireApiSession, handleApiError, ApiError } from '@/lib/auth/api-guard';
import { messageSchema } from '@/lib/domain/validation';
import { getMessages, getThreadById, sendMessage } from '@/lib/data/messages';
import type { Session } from '@/lib/auth/session';

/** A thread is only readable/writable by its buyer, its supplier, or an admin. */
async function assertThreadParticipant(session: Session, threadId: string) {
  const thread = await getThreadById(threadId);
  if (!thread) throw new ApiError('Conversation not found.', 404);
  const isParticipant =
    session.user.role === 'admin' ||
    (session.user.role === 'buyer' && session.buyerProfileId === thread.buyerId) ||
    (session.user.role === 'supplier' && session.supplierProfileId === thread.supplierId);
  if (!isParticipant) throw new ApiError('You do not have access to this conversation.', 403);
  return thread;
}

export async function GET(_request: Request, { params }: { params: Promise<{ threadId: string }> }) {
  try {
    const session = await requireApiSession();
    const { threadId } = await params;
    await assertThreadParticipant(session, threadId);
    const messages = await getMessages(threadId);
    return NextResponse.json({ ok: true, messages });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ threadId: string }> }) {
  try {
    const session = await requireApiSession();
    const { threadId } = await params;
    await assertThreadParticipant(session, threadId);
    const body = await request.json().catch(() => null);
    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? 'Invalid input.');

    const message = await sendMessage(threadId, session.user.id, session.user.role, parsed.data.body);
    return NextResponse.json({ ok: true, message });
  } catch (err) {
    return handleApiError(err);
  }
}
