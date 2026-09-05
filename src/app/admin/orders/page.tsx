import Link from 'next/link';
import { StatusPill } from '@/components/order/status-pill';
import { getAllOrders, getAllSuppliers } from '@/lib/data/admin';
import { getBuyerDisplayNames } from '@/lib/data/profile';
import { formatMoney } from '@/lib/utils/money';

export default async function AdminOrdersPage() {
  const [orders, suppliers, buyerNames] = await Promise.all([
    getAllOrders(),
    getAllSuppliers(),
    getBuyerDisplayNames(),
  ]);
  const supplierNames = Object.fromEntries(suppliers.map((s) => [s.id, s.storeName]));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Order monitoring</h1>
      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full min-w-[840px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Buyer</th>
              <th className="px-4 py-3 font-medium">Supplier</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Placed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3 font-medium text-ink">
                  <Link href={`/admin/orders/${o.id}`} className="hover:text-primary hover:underline">
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-soft">{buyerNames[o.buyerId] ?? '—'}</td>
                <td className="px-4 py-3 text-ink-soft">{supplierNames[o.supplierId] ?? '—'}</td>
                <td className="px-4 py-3 text-ink-soft">{formatMoney(o.totalSen)}</td>
                <td className="px-4 py-3">
                  <StatusPill status={o.status} />
                </td>
                <td className="px-4 py-3 text-ink-soft">{new Date(o.placedAt).toLocaleDateString('en-MY', { dateStyle: 'medium' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
