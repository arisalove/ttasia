import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusPill } from '@/components/order/status-pill';
import { OrderTimeline } from '@/components/order/order-timeline';
import { SupplierOrderActions } from '@/components/order/supplier-order-actions';
import { getOrderById } from '@/lib/data/orders';
import { getAllSuppliers } from '@/lib/data/admin';
import { getBuyerDisplayNames } from '@/lib/data/profile';
import { formatMoney } from '@/lib/utils/money';

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const [suppliers, buyerNames] = await Promise.all([getAllSuppliers(), getBuyerDisplayNames()]);
  const supplier = suppliers.find((s) => s.id === order.supplierId);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            {buyerNames[order.buyerId] ?? 'Buyer'} → {supplier?.storeName ?? 'Supplier'}
          </p>
        </div>
        <StatusPill status={order.status} />
      </div>

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
          <CardTitle>Admin actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            As an admin you can force a status change if a buyer or supplier is unresponsive — use with care.
          </p>
          <SupplierOrderActions order={order} />
        </CardContent>
      </Card>
    </div>
  );
}
