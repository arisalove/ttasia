import { OrderListItem } from '@/components/order/order-list-item';
import { EmptyState } from '@/components/ui/empty-state';
import { getSession } from '@/lib/auth/session';
import { getOrdersForSupplier } from '@/lib/data/orders';
import { getBuyerDisplayNames } from '@/lib/data/profile';

export default async function SupplierOrdersPage() {
  const session = await getSession();
  const supplierId = session!.supplierProfileId!;
  const [orders, buyerNames] = await Promise.all([getOrdersForSupplier(supplierId), getBuyerDisplayNames()]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Orders</h1>
      {orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Orders placed by buyers will appear here." />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderListItem
              key={order.id}
              order={order}
              href={`/supplier/orders/${order.id}`}
              counterpartyLabel={buyerNames[order.buyerId] ?? 'Buyer'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
