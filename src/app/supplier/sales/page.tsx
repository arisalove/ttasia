import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SalesChart } from '@/components/supplier/sales-chart';
import { getSession } from '@/lib/auth/session';
import { getSalesSummary } from '@/lib/data/suppliers';
import { formatMoney } from '@/lib/utils/money';

export default async function SupplierSalesPage() {
  const session = await getSession();
  const summary = await getSalesSummary(session!.supplierProfileId!);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Sales summary</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Total orders" value={String(summary.totalOrders)} />
        <Stat label="Completed" value={String(summary.completedOrders)} />
        <Stat label="Pending" value={String(summary.pendingOrders)} />
        <Stat label="Total revenue" value={formatMoney(summary.totalRevenueSen)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue over time</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesChart data={summary.revenueByDay} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top products</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sales yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {summary.topProducts.map((p, i) => (
                <div key={p.productId} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-700">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-ink">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.qtySold} units sold</p>
                    </div>
                  </div>
                  <p className="font-semibold text-ink">{formatMoney(p.revenueSen)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-5">
        <p className="text-2xl font-bold text-ink">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
