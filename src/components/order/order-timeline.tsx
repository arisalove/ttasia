import { Check, X } from 'lucide-react';
import { ORDER_STATUS_LABEL } from '@/lib/domain/orders';
import type { OrderStatus } from '@/lib/domain/types';
import { cn } from '@/lib/utils/cn';

const DELIVERY_FLOW: OrderStatus[] = [
  'pending_payment',
  'awaiting_supplier_confirmation',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'completed',
];

const PICKUP_FLOW: OrderStatus[] = [
  'awaiting_supplier_confirmation',
  'confirmed',
  'preparing',
  'ready_for_pickup',
  'completed',
];

export function OrderTimeline({
  status,
  fulfilmentMethod,
}: {
  status: OrderStatus;
  fulfilmentMethod: 'delivery' | 'pickup';
}) {
  if (status === 'cancelled' || status === 'disputed') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive text-white">
          <X className="h-4 w-4" />
        </div>
        <div>
          <p className="font-semibold text-destructive">{ORDER_STATUS_LABEL[status].en}</p>
          <p className="text-sm text-muted-foreground">
            {status === 'cancelled' ? 'This order will not be fulfilled.' : 'TapTap support is reviewing this order.'}
          </p>
        </div>
      </div>
    );
  }

  const flow = fulfilmentMethod === 'pickup' ? PICKUP_FLOW : DELIVERY_FLOW;
  const currentIndex = flow.indexOf(status);

  return (
    <ol className="flex flex-col gap-0">
      {flow.map((step, i) => {
        const done = currentIndex >= 0 && i < currentIndex;
        const active = i === currentIndex;
        const isLast = i === flow.length - 1;
        return (
          <li key={step} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast && (
              <span
                className={cn('absolute left-[15px] top-8 h-full w-0.5', done || active ? 'bg-primary' : 'bg-border')}
                aria-hidden
              />
            )}
            <span
              className={cn(
                'z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold',
                done && 'border-primary bg-primary text-white',
                active && 'border-primary bg-white text-primary',
                !done && !active && 'border-border bg-white text-muted-foreground',
              )}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <div className="pt-1">
              <p className={cn('font-medium', active ? 'text-ink' : done ? 'text-ink-soft' : 'text-muted-foreground')}>
                {ORDER_STATUS_LABEL[step].en}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
