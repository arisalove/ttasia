import { DisputeResolver } from '@/components/admin/dispute-resolver';
import { getDisputes, getAllOrders } from '@/lib/data/admin';

export default async function AdminDisputesPage() {
  const [disputes, orders] = await Promise.all([getDisputes(), getAllOrders()]);
  const orderNumbers = Object.fromEntries(orders.map((o) => [o.id, o.orderNumber]));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Disputes</h1>
      <DisputeResolver disputes={disputes} orderNumbers={orderNumbers} />
    </div>
  );
}
