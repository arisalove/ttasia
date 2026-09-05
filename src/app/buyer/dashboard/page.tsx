import Link from 'next/link';
import { Package, FileText, Heart, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/order/status-pill';
import { EmptyState } from '@/components/ui/empty-state';
import { CategoryIcon } from '@/components/product/category-icon';
import { getSession } from '@/lib/auth/session';
import { getOrdersForBuyer } from '@/lib/data/orders';
import { getQuotationsForBuyer } from '@/lib/data/quotations';
import { getFavourites } from '@/lib/data/favourites';
import { getCategories } from '@/lib/data/catalogue';
import { formatMoney } from '@/lib/utils/money';
import { isTerminal } from '@/lib/domain/orders';

export default async function BuyerDashboardPage() {
  const session = await getSession();
  const buyerId = session!.buyerProfileId!;

  const [orders, quotations, favourites, categories] = await Promise.all([
    getOrdersForBuyer(buyerId),
    getQuotationsForBuyer(buyerId),
    getFavourites(buyerId),
    getCategories(),
  ]);

  const activeOrders = orders.filter((o) => !isTerminal(o.status));
  const pendingQuotes = quotations.filter((q) => q.status === 'requested' || q.status === 'quoted');

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Welcome back, {session!.user.fullName.split(' ')[0]}</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your TapTap account.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Package} label="Active orders" value={activeOrders.length} href="/buyer/orders" />
        <StatCard icon={FileText} label="Pending quotations" value={pendingQuotes.length} href="/buyer/rfq" />
        <StatCard icon={Heart} label="Favourites" value={favourites.length} href="/buyer/favourites" />
        <StatCard icon={RotateCcw} label="Total orders" value={orders.length} href="/buyer/orders/history" />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Active orders</h2>
          <Link href="/buyer/orders" className="text-sm font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>
        {activeOrders.length === 0 ? (
          <EmptyState
            title="No active orders"
            description="Browse the catalogue to place your first order."
            action={
              <Button asChild size="sm">
                <Link href="/buyer/catalogue">Browse catalogue</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {activeOrders.slice(0, 4).map((order) => (
              <Link key={order.id} href={`/buyer/orders/${order.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-semibold text-ink">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{formatMoney(order.totalSen)}</p>
                    </div>
                    <StatusPill status={order.status} />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-ink">Browse categories</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/buyer/category/${cat.slug}`}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <CategoryIcon icon={cat.icon} className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium text-ink-soft">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, href }: { icon: React.ElementType; label: string; value: number; href: string }) {
  return (
    <Link href={href}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-ink">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
