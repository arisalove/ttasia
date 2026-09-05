import Link from 'next/link';
import { OrderListItem } from '@/components/order/order-list-item';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { getSession } from '@/lib/auth/session';
import { getOrdersForBuyer } from '@/lib/data/orders';
import { getAllSuppliers } from '@/lib/data/admin';
import { isTerminal } from '@/lib/domain/orders';

export default async function BuyerCurrentOrdersPage() {
  const session = await getSession();
  const buyerId = session!.buyerProfileId!;
  const [orders, suppliers] = await Promise.all([getOrdersForBuyer(buyerId), getAllSuppliers()]);
  const supplierNames = Object.fromEntries(suppliers.map((s) => [s.id, s.storeName]));

  const currentOrders = orders.filter((o) => !isTerminal(o.status));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Current orders</h1>
        <Link href="/buyer/orders/history" className="text-sm font-semibold text-primary hover:underline">
          View order history
        </Link>
      </div>

      {currentOrders.length === 0 ? (
        <EmptyState
          title="No current orders"
          description="Orders in progress will show up here."
          action={
            <Button asChild size="sm">
              <Link href="/buyer/catalogue">Browse catalogue</Link>
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {currentOrders.map((order) => (
            <OrderListItem
              key={order.id}
              order={order}
              href={`/buyer/orders/${order.id}`}
              counterpartyLabel={supplierNames[order.supplierId] ?? 'Supplier'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
