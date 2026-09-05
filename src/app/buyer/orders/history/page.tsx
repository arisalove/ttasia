import { OrderListItem } from '@/components/order/order-list-item';
import { EmptyState } from '@/components/ui/empty-state';
import { getSession } from '@/lib/auth/session';
import { getOrdersForBuyer } from '@/lib/data/orders';
import { getAllSuppliers } from '@/lib/data/admin';

export default async function BuyerOrderHistoryPage() {
  const session = await getSession();
  const buyerId = session!.buyerProfileId!;
  const [orders, suppliers] = await Promise.all([getOrdersForBuyer(buyerId), getAllSuppliers()]);
  const supplierNames = Object.fromEntries(suppliers.map((s) => [s.id, s.storeName]));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Order history</h1>
      {orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Your complete order history will appear here." />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
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
