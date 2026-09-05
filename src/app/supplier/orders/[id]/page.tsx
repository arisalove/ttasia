import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusPill } from '@/components/order/status-pill';
import { OrderTimeline } from '@/components/order/order-timeline';
import { SupplierOrderActions } from '@/components/order/supplier-order-actions';
import { getSession } from '@/lib/auth/session';
import { getOrderById } from '@/lib/data/orders';
import { getBuyerDisplayNames } from '@/lib/data/profile';
import { formatMoney } from '@/lib/utils/money';

export default async function SupplierOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const order = await getOrderById(id);
  if (!order || order.supplierId !== session!.supplierProfileId) notFound();

  const buyerNames = await getBuyerDisplayNames();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/supplier/orders" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            From {buyerNames[order.buyerId] ?? 'Buyer'} · Placed{' '}
            {new Date(order.placedAt).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>
        <StatusPill status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order progress</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline status={order.status} fulfilmentMethod={order.fulfilmentMethod} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium text-ink">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.qty} {item.unit} × {formatMoney(item.unitPriceSen)}
                    </p>
                  </div>
                  <p className="font-semibold text-ink">{formatMoney(item.lineTotalSen)}</p>
                </div>
              ))}
              <div className="flex justify-between pt-3 text-base font-bold text-ink">
                <span>Total</span>
                <span>{formatMoney(order.totalSen)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Update status</CardTitle>
            </CardHeader>
            <CardContent>
              <SupplierOrderActions order={order} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Buyer</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="font-semibold text-ink">{buyerNames[order.buyerId] ?? 'Buyer'}</p>
              <Link
                href={`/supplier/messages?buyerId=${order.buyerId}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <MessageCircle className="h-4 w-4" /> Message buyer
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fulfilment</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm text-ink-soft">
              <p className="font-medium text-ink capitalize">{order.fulfilmentMethod}</p>
              {order.district && <p>{order.district}</p>}
              {order.deliveryAddress && <p>{order.deliveryAddress}</p>}
              <div className="mt-2 border-t border-border pt-2">
                <p className="font-medium text-ink">Payment method</p>
                <p className="capitalize">{order.paymentMethod.replace('_', ' ')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
