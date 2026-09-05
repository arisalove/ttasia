'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { ORDER_STATUS_LABEL, actorForTransition, nextStatuses } from '@/lib/domain/orders';
import type { Order, OrderStatus } from '@/lib/domain/types';

export function SupplierOrderActions({ order }: { order: Order }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loadingStatus, setLoadingStatus] = useState<OrderStatus | null>(null);

  const actionable = nextStatuses(order.status).filter((s) => {
    const actor = actorForTransition(s);
    return actor === 'supplier' || actor === 'buyer_or_supplier';
  });

  async function moveTo(status: OrderStatus) {
    if (status === 'cancelled' && !confirm('Cancel this order? This cannot be undone.')) return;
    setLoadingStatus(status);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? 'Could not update order status.', 'error');
        return;
      }
      toast(`Order marked as "${ORDER_STATUS_LABEL[status].en}".`, 'success');
      router.refresh();
    } finally {
      setLoadingStatus(null);
    }
  }

  if (actionable.length === 0) {
    return <p className="text-sm text-muted-foreground">No further action is needed on this order right now.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {actionable.map((status) => (
        <Button
          key={status}
          variant={status === 'cancelled' ? 'outline' : 'default'}
          className={status === 'cancelled' ? 'text-destructive hover:bg-destructive/10' : undefined}
          onClick={() => moveTo(status)}
          loading={loadingStatus === status}
        >
          Mark as {ORDER_STATUS_LABEL[status].en}
        </Button>
      ))}
    </div>
  );
}
