'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import type { Dispute, DisputeStatus } from '@/lib/domain/types';

const STATUS_VARIANT: Record<DisputeStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  open: 'warning',
  investigating: 'default',
  resolved: 'success',
  rejected: 'secondary',
};

export function DisputeResolver({ disputes, orderNumbers }: { disputes: Dispute[]; orderNumbers: Record<string, string> }) {
  if (disputes.length === 0) {
    return <EmptyState title="No disputes" description="Buyer or supplier disputes will appear here for review." />;
  }
  return (
    <div className="flex flex-col gap-4">
      {disputes.map((d) => (
        <DisputeRow key={d.id} dispute={d} orderNumber={orderNumbers[d.orderId] ?? d.orderId} />
      ))}
    </div>
  );
}

function DisputeRow({ dispute, orderNumber }: { dispute: Dispute; orderNumber: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [note, setNote] = useState(dispute.resolutionNote ?? '');
  const [loading, setLoading] = useState<DisputeStatus | null>(null);

  const isOpen = dispute.status === 'open' || dispute.status === 'investigating';

  async function updateStatus(status: DisputeStatus) {
    setLoading(status);
    try {
      const res = await fetch(`/api/admin/disputes/${dispute.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolutionNote: note }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? 'Could not update this dispute.', 'error');
        return;
      }
      toast('Dispute updated.', 'success');
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <Link href={`/admin/orders/${dispute.orderId}`} className="font-semibold text-ink hover:text-primary hover:underline">
              {orderNumber}
            </Link>
            <p className="text-sm text-muted-foreground">{dispute.reason}</p>
          </div>
          <Badge variant={STATUS_VARIANT[dispute.status]} className="capitalize">
            {dispute.status}
          </Badge>
        </div>

        {isOpen ? (
          <div className="mt-3 flex flex-col gap-3">
            <Textarea rows={2} placeholder="Resolution note…" value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => updateStatus('investigating')} loading={loading === 'investigating'} variant="outline">
                Mark investigating
              </Button>
              <Button size="sm" onClick={() => updateStatus('resolved')} loading={loading === 'resolved'}>
                Resolve
              </Button>
              <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => updateStatus('rejected')} loading={loading === 'rejected'}>
                Reject
              </Button>
            </div>
          </div>
        ) : (
          dispute.resolutionNote && <p className="mt-3 rounded-lg bg-surface-muted p-3 text-sm text-ink-soft">{dispute.resolutionNote}</p>
        )}
      </CardContent>
    </Card>
  );
}
