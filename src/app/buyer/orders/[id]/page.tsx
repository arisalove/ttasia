import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, MessageCircle, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusPill } from '@/components/order/status-pill';
import { OrderTimeline } from '@/components/order/order-timeline';
import { BuyerOrderActions } from '@/components/order/buyer-order-actions';
import { getSession } from '@/lib/auth/session';
import { getOrderById } from '@/lib/data/orders';
import { getAllSuppliers } from '@/lib/data/admin';
import { getReviewsForSupplier } from '@/lib/data/reviews';
import { formatMoney } from '@/lib/utils/money';

export default async function BuyerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const order = await getOrderById(id);

  if (!order || order.buyerId !== session!.buyerProfileId) notFound();

  const [suppliers, reviews] = await Promise.all([getAllSuppliers(), getReviewsForSupplier(order.supplierId)]);
  const supplier = suppliers.find((s) => s.id === order.supplierId);
  const hasReview = reviews.some((r) => r.orderId === order.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/buyer/orders" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            Placed {new Date(order.placedAt).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })}
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
              <div className="flex flex-col gap-1 pt-3 text-sm">
                <div className="flex justify-between text-ink-soft">
                  <span>Subtotal</span>
                  <span>{formatMoney(order.subtotalSen)}</span>
                </div>
                <div className="flex justify-between text-ink-soft">
                  <span>{order.fulfilmentMethod === 'pickup' ? 'Pickup fee' : 'Delivery fee'}</span>
                  <span>{order.deliveryFeeSen === 0 ? 'Free' : formatMoney(order.deliveryFeeSen)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-ink">
                  <span>Total</span>
                  <span>{formatMoney(order.totalSen)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What can I do?</CardTitle>
            </CardHeader>
            <CardContent>
              <BuyerOrderActions order={order} hasReview={hasReview} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Link href={`/suppliers/${supplier?.storeSlug ?? ''}`} className="font-semibold text-ink hover:text-primary">
                {supplier?.storeName ?? 'Supplier'}
              </Link>
              <Link
                href={`/buyer/messages?supplierId=${order.supplierId}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <MessageCircle className="h-4 w-4" /> Message supplier
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fulfilment</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm text-ink-soft">
              <div className="flex items-start gap-2">
                {order.fulfilmentMethod === 'pickup' ? <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> : <Truck className="mt-0.5 h-4 w-4 shrink-0" />}
                <div>
                  <p className="font-medium text-ink">{order.fulfilmentMethod === 'pickup' ? 'Self-pickup' : 'Delivery'}</p>
                  {order.district && <p>{order.district}</p>}
                  {order.deliveryAddress && <p>{order.deliveryAddress}</p>}
                </div>
              </div>
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
