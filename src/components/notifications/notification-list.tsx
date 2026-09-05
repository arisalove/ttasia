'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, FileText, MessageCircle, Package, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import type { Notification, NotificationType } from '@/lib/domain/types';
import { cn } from '@/lib/utils/cn';

const ICON: Record<NotificationType, typeof Bell> = {
  order_status: Package,
  quotation: FileText,
  message: MessageCircle,
  verification: ShieldCheck,
  system: Bell,
};

export function NotificationList({ notifications }: { notifications: Notification[] }) {
  const router = useRouter();
  const [items, setItems] = useState(notifications);
  const [markingAll, setMarkingAll] = useState(false);

  async function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n)));
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    router.refresh();
  }

  async function markAllRead() {
    setMarkingAll(true);
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
      router.refresh();
    } finally {
      setMarkingAll(false);
    }
  }

  const hasUnread = items.some((n) => !n.readAt);

  if (items.length === 0) {
    return <EmptyState icon={<Bell />} title="No notifications" description="You're all caught up." />;
  }

  return (
    <div className="flex flex-col gap-3">
      {hasUnread && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={markAllRead} loading={markingAll}>
            <CheckCheck className="h-4 w-4" /> Mark all as read
          </Button>
        </div>
      )}
      <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-white">
        {items.map((n) => {
          const Icon = ICON[n.type];
          const content = (
            <div
              className={cn(
                'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-warm',
                !n.readAt && 'bg-primary-50/60',
              )}
            >
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                  n.readAt ? 'bg-surface-muted text-muted-foreground' : 'bg-primary text-white',
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">{n.title}</p>
                <p className="truncate text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(n.createdAt).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              {!n.readAt && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
            </div>
          );
          return (
            <div key={n.id} onClick={() => !n.readAt && markRead(n.id)}>
              {n.href ? <Link href={n.href}>{content}</Link> : content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
