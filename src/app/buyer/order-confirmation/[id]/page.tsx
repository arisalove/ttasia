import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getOrderById } from '@/lib/data/orders';
import { formatMoney } from '@/lib/utils/money';

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ also?: string }>;
}) {
  const { id } = await params;
  const { also } = await searchParams;
  const order = await getOrderById(id);
  if (!order) notFound();

  const otherIds = also ? also.split(',').filter(Boolean) : [];
  const otherOrders = (await Promise.all(otherIds.map((oid) => getOrderById(oid)))).filter(Boolean);
  const allOrders = [order, ...otherOrders].filter(Boolean) as NonNullable<typeof order>[];

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 className="h-14 w-14 text-success" />
        <h1 className="text-2xl font-bold text-ink">Order{allOrders.length > 1 ? 's' : ''} placed!</h1>
        <p className="text-muted-foreground">
          {allOrders.length > 1
            ? `Your cart was split into ${allOrders.length} orders, one per supplier.`
            : "We've notified the supplier — you can track progress from your orders page."}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {allOrders.map((o) => (
          <Card key={o.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold text-ink">{o.orderNumber}</p>
                <p className="text-sm text-muted-foreground">{formatMoney(o.totalSen)} · {o.paymentMethod.replace('_', ' ')}</p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href={`/buyer/orders/${o.id}`}>Track order</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button asChild className="flex-1">
          <Link href="/buyer/orders">View my orders</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/buyer/catalogue">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}
