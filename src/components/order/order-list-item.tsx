import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { StatusPill } from './status-pill';
import { formatMoney } from '@/lib/utils/money';
import type { Order } from '@/lib/domain/types';

export function OrderListItem({
  order,
  href,
  counterpartyLabel,
}: {
  order: Order;
  href: string;
  counterpartyLabel: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4">
          <div>
            <p className="font-semibold text-ink">{order.orderNumber}</p>
            <p className="text-sm text-muted-foreground">{counterpartyLabel}</p>
            <p className="text-xs text-muted-foreground">{new Date(order.placedAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-ink">{formatMoney(order.totalSen)}</p>
            <StatusPill status={order.status} className="mt-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
