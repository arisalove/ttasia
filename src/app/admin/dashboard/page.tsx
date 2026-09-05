import Link from 'next/link';
import { AlertTriangle, Package, ShieldCheck, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMarketplaceStats, getPendingSuppliers, getDisputes } from '@/lib/data/admin';
import { formatMoney } from '@/lib/utils/money';

export default async function AdminDashboardPage() {
  const [stats, pendingSuppliers, disputes] = await Promise.all([getMarketplaceStats(), getPendingSuppliers(), getDisputes()]);
  const openDisputes = disputes.filter((d) => d.status === 'open' || d.status === 'investigating');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Marketplace overview</h1>
        <p className="text-sm text-muted-foreground">A snapshot of TapTap&apos;s activity across Sabah.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Buyers" value={String(stats.totalBuyers)} icon={Users} />
        <Stat label="Suppliers" value={String(stats.totalSuppliers)} icon={ShoppingBag} sub={`${stats.verifiedSuppliers} verified`} />
        <Stat label="Products" value={String(stats.totalProducts)} icon={Package} />
        <Stat label="Orders" value={String(stats.totalOrders)} icon={ShoppingBag} />
        <Stat label="GMV" value={formatMoney(stats.gmvSen)} icon={TrendingUp} />
        <Stat label="Open disputes" value={String(stats.openDisputes)} icon={AlertTriangle} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Pending verifications</CardTitle>
            <Link href="/admin/verification" className="text-sm font-semibold text-primary hover:underline">
              Review all
            </Link>
          </CardHeader>
          <CardContent>
            {pendingSuppliers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No suppliers waiting for review.</p>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {pendingSuppliers.slice(0, 5).map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-warning" />
                      <p className="font-medium text-ink">{s.storeName}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{s.supplierType}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Open disputes</CardTitle>
            <Link href="/admin/disputes" className="text-sm font-semibold text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {openDisputes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No open disputes right now.</p>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {openDisputes.slice(0, 5).map((d) => (
                  <div key={d.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <p className="truncate text-sm text-ink">{d.reason}</p>
                    <span className="text-xs uppercase text-warning">{d.status}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, sub }: { label: string; value: string; icon: typeof Package; sub?: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1.5 p-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-xl font-bold text-ink">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {sub && <p className="text-[11px] font-medium text-success">{sub}</p>}
      </CardContent>
    </Card>
  );
}
