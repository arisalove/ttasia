import 'server-only';
import { isDemoMode } from '../supabase/env';
import { getState, nextId, nowIso } from './demo-store';
import type { Message, MessageThread, UserRole } from '../domain/types';

export async function getThreadsForBuyer(buyerId: string): Promise<MessageThread[]> {
  if (isDemoMode()) {
    return getState()
      .messageThreads.filter((t) => t.buyerId === buyerId)
      .sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1));
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('message_threads').select('*').eq('buyer_id', buyerId).order('last_message_at', { ascending: false });
  return (data ?? []).map(mapDbThread);
}

export async function getThreadsForSupplier(supplierId: string): Promise<MessageThread[]> {
  if (isDemoMode()) {
    return getState()
      .messageThreads.filter((t) => t.supplierId === supplierId)
      .sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1));
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('message_threads').select('*').eq('supplier_id', supplierId).order('last_message_at', { ascending: false });
  return (data ?? []).map(mapDbThread);
}

export async function getOrCreateThread(buyerId: string, supplierId: string): Promise<MessageThread> {
  if (isDemoMode()) {
    const state = getState();
    let thread = state.messageThreads.find((t) => t.buyerId === buyerId && t.supplierId === supplierId);
    if (!thread) {
      thread = { id: nextId('thread'), buyerId, supplierId, lastMessageAt: nowIso(), lastMessagePreview: '' };
      state.messageThreads.push(thread);
    }
    return thread;
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from('message_threads')
    .select('*')
    .eq('buyer_id', buyerId)
    .eq('supplier_id', supplierId)
    .maybeSingle();
  if (existing) return mapDbThread(existing);
  const { data: created } = await supabase
    .from('message_threads')
    .insert({ buyer_id: buyerId, supplier_id: supplierId })
    .select('*')
    .single();
  return mapDbThread(created);
}

export async function getThreadById(threadId: string): Promise<MessageThread | null> {
  if (isDemoMode()) {
    return getState().messageThreads.find((t) => t.id === threadId) ?? null;
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('message_threads').select('*').eq('id', threadId).maybeSingle();
  return data ? mapDbThread(data) : null;
}

export async function getMessages(threadId: string): Promise<Message[]> {
  if (isDemoMode()) {
    return getState()
      .messages.filter((m) => m.threadId === threadId)
      .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('messages').select('*').eq('thread_id', threadId).order('created_at');
  return (data ?? []).map(mapDbMessage);
}

export async function sendMessage(threadId: string, senderId: string, senderRole: UserRole, body: string): Promise<Message> {
  if (isDemoMode()) {
    const state = getState();
    const message: Message = { id: nextId('msg'), threadId, senderId, senderRole, body, createdAt: nowIso() };
    state.messages.push(message);
    const thread = state.messageThreads.find((t) => t.id === threadId);
    if (thread) {
      thread.lastMessageAt = message.createdAt;
      thread.lastMessagePreview = body.slice(0, 140);

      const recipientUserId =
        senderRole === 'buyer'
          ? state.supplierProfiles.find((s) => s.id === thread.supplierId)?.userId
          : state.buyerProfiles.find((b) => b.id === thread.buyerId)?.userId;
      if (recipientUserId) {
        state.notifications.unshift({
          id: nextId('notif'),
          userId: recipientUserId,
          type: 'message',
          title: 'New message',
          body: body.slice(0, 140),
          href: senderRole === 'buyer' ? '/supplier/messages' : '/buyer/messages',
          createdAt: nowIso(),
        });
      }
    }
    return message;
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase
    .from('messages')
    .insert({ thread_id: threadId, sender_id: senderId, sender_role: senderRole, body })
    .select('*')
    .single();
  await supabase.from('message_threads').update({ last_message_at: new Date().toISOString(), last_message_preview: body.slice(0, 140) }).eq('id', threadId);
  return mapDbMessage(data);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbThread(row: any): MessageThread {
  return {
    id: row.id,
    buyerId: row.buyer_id,
    supplierId: row.supplier_id,
    lastMessageAt: row.last_message_at,
    lastMessagePreview: row.last_message_preview,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbMessage(row: any): Message {
  return {
    id: row.id,
    threadId: row.thread_id,
    senderId: row.sender_id,
    senderRole: row.sender_role,
    body: row.body,
    createdAt: row.created_at,
    readAt: row.read_at ?? undefined,
  };
}
