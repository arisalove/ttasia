import 'server-only';
import { isDemoMode } from '../supabase/env';
import { getState, nowIso } from './demo-store';
import type { Notification } from '../domain/types';

export async function getNotifications(userId: string): Promise<Notification[]> {
  if (isDemoMode()) {
    return getState()
      .notifications.filter((n) => n.userId === userId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return (data ?? []).map((n) => ({
    id: n.id,
    userId: n.user_id,
    type: n.type,
    title: n.title,
    body: n.body,
    href: n.href ?? undefined,
    readAt: n.read_at ?? undefined,
    createdAt: n.created_at,
  }));
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  if (isDemoMode()) {
    const notif = getState().notifications.find((n) => n.id === notificationId);
    if (notif) notif.readAt = nowIso();
    return;
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', notificationId);
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  if (isDemoMode()) {
    const state = getState();
    state.notifications.filter((n) => n.userId === userId).forEach((n) => (n.readAt = n.readAt ?? nowIso()));
    return;
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', userId).is('read_at', null);
}
