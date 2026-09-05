import Link from 'next/link';
import { AlertTriangle, ClipboardList, FileText, Package, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderListItem } from '@/components/order/order-list-item';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { getSession } from '@/lib/auth/session';
import { getSupplierProfile, getProductsForSupplier, getSalesSummary } from '@/lib/data/suppliers';
import { getOrdersForSupplier } from '@/lib/data/orders';
import { getQuotationsForSupplier } from '@/lib/data/quotations';
import { isTerminal } from '@/lib/domain/orders';
import { formatMoney } from '@/lib/utils/money';

export default async function SupplierDashboardPage() {
  const session = await getSession();
  const supplierId = session!.supplierProfileId!;

  const [supplier, products, orders, quotations, summary] = await Promise.all([
    getSupplierProfile(supplierId),
    getProductsForSupplier(supplierId),
    getOrdersForSupplier(supplierId),
    getQuotationsForSupplier(supplierId),
    getSalesSummary(supplierId),
  ]);

  const activeOrders = orders.filter((o) => !isTerminal(o.status)).slice(0, 5);
  const pendingQuotes = quotations.filter((q) => q.status === 'requested').length;
  const lowStockProducts = products.filter((p) => p.isActive && p.stockQty <= 5).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Welcome back, {supplier?.storeName ?? session!.user.fullName}</h1>
        <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your store today.</p>
      </div>

      {supplier?.verificationStatus !== 'verified' && (
        <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div className="flex-1">
            <p className="font-semibold text-ink">
              {supplier?.verificationStatus === 'pending' ? 'Your verification is under review' : 'Your store is not yet verified'}
            </p>
            <p className="text-sm text-ink-soft">
              {supplier?.verificationStatus === 'pending'
                ? "Admins are reviewing your documents. Your storefront won't appear publicly until it's approved."
                : 'Submit your verification documents so buyers can find and order from your store.'}
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/supplier/verification">View status</Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Active orders" value={String(orders.filter((o) => !isTerminal(o.status)).length)} icon={ClipboardList} />
        <StatCard label="Products listed" value={String(products.length)} icon={Package} sub={lowStockProducts > 0 ? `${lowStockProducts} low stock` : undefined} />
        <StatCard label="Pending RFQs" value={String(pendingQuotes)} icon={FileText} />
        <StatCard label="Revenue (30d)" value={formatMoney(summary.last30DaysRevenueSen)} icon={TrendingUp} />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent active orders</CardTitle>
          <Link href="/supplier/orders" className="text-sm font-semibold text-primary hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {activeOrders.length === 0 ? (
            <EmptyState title="No active orders" description="New orders from buyers will show up here." />
          ) : (
            <div className="flex flex-col gap-3">
              {activeOrders.map((order) => (
                <OrderListItem key={order.id} order={order} href={`/supplier/orders/${order.id}`} counterpartyLabel="Buyer" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, sub }: { label: string; value: string; icon: typeof Package; sub?: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <p className="text-2xl font-bold text-ink">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {sub && <p className="text-xs font-medium text-warning">{sub}</p>}
      </CardContent>
    </Card>
  );
}
