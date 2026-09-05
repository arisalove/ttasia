'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils/cn';
import type { Message } from '@/lib/domain/types';

export interface MessengerThread {
  id: string;
  counterpartyId: string;
  counterpartyName: string;
  lastMessagePreview: string;
  lastMessageAt: string;
}

export function Messenger({
  threads,
  currentUserId,
  initialThreadId,
  counterpartyParam,
  startThreadHref,
}: {
  threads: MessengerThread[];
  currentUserId: string;
  initialThreadId?: string;
  /** query-param name a caller can use to deep-link into a NEW thread with a given counterparty id (e.g. ?supplierId=sup-1) */
  counterpartyParam?: 'supplierId' | 'buyerId';
  /** API path used to create-or-resume a thread when arriving via counterpartyParam */
  startThreadHref?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [activeThreadId, setActiveThreadId] = useState<string | undefined>(initialThreadId ?? threads[0]?.id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [, startTransition] = useTransition();

  // Deep-link: resume/create a thread with a given counterparty then select it.
  useEffect(() => {
    const counterpartyId = counterpartyParam ? searchParams.get(counterpartyParam) : null;
    if (!counterpartyId || !startThreadHref) return;
    const existing = threads.find((t) => t.counterpartyId === counterpartyId);
    if (existing) {
      setActiveThreadId(existing.id);
      return;
    }
    fetch(startThreadHref, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [counterpartyParam]: counterpartyId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.thread) {
          startTransition(() => router.refresh());
          setActiveThreadId(data.thread.id);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counterpartyParam, startThreadHref]);

  useEffect(() => {
    if (!activeThreadId) return;
    setLoadingMessages(true);
    fetch(`/api/messages/${activeThreadId}`)
      .then((r) => r.json())
      .then((data) => setMessages(data.messages ?? []))
      .finally(() => setLoadingMessages(false));
  }, [activeThreadId]);

  async function send() {
    if (!activeThreadId || !draft.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/messages/${activeThreadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: draft.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? 'Could not send message.', 'error');
        return;
      }
      setMessages((prev) => [...prev, data.message]);
      setDraft('');
      router.refresh();
    } finally {
      setSending(false);
    }
  }

  if (threads.length === 0) {
    return <EmptyState title="No conversations yet" description="Messages with suppliers and buyers will appear here." />;
  }

  const activeThread = threads.find((t) => t.id === activeThreadId);

  return (
    <div className="grid h-[70vh] min-h-[480px] grid-cols-1 overflow-hidden rounded-xl border border-border bg-white md:grid-cols-[280px_1fr]">
      <div className="flex flex-col overflow-y-auto border-b border-border md:border-b-0 md:border-r">
        {threads.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveThreadId(t.id)}
            className={cn(
              'flex flex-col gap-0.5 border-b border-border px-4 py-3 text-left transition-colors hover:bg-surface-warm',
              t.id === activeThreadId && 'bg-primary-50',
            )}
          >
            <p className="truncate font-semibold text-ink">{t.counterpartyName}</p>
            <p className="truncate text-sm text-muted-foreground">{t.lastMessagePreview || 'No messages yet'}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-col">
        <div className="border-b border-border px-4 py-3">
          <p className="font-semibold text-ink">{activeThread?.counterpartyName}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loadingMessages ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.map((m) => {
                const isMine = m.senderId === currentUserId;
                return (
                  <div key={m.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[75%] rounded-2xl px-4 py-2 text-sm',
                        isMine ? 'bg-primary text-white' : 'bg-surface-warm text-ink',
                      )}
                    >
                      {m.body}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 border-t border-border p-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Type a message…"
            className="flex-1 rounded-full border border-border bg-surface-warm px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
          <Button size="icon" onClick={send} loading={sending} aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
