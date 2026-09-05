import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllProducts, getAllSuppliers } from '@/lib/data/admin';
import { getCategories } from '@/lib/data/catalogue';
import { formatMoney } from '@/lib/utils/money';

export default async function AdminProductsPage() {
  const [products, suppliers, categories] = await Promise.all([getAllProducts(), getAllSuppliers(), getCategories()]);
  const supplierNames = Object.fromEntries(suppliers.map((s) => [s.id, s.storeName]));
  const categoryNames = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const productCountByCategory = new Map<string, number>();
  for (const p of products) productCountByCategory.set(p.categoryId, (productCountByCategory.get(p.categoryId) ?? 0) + 1);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Products &amp; categories</h1>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Badge key={c.id} variant="outline">
              {c.name} · {productCountByCategory.get(c.id) ?? 0}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Supplier</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-3 font-medium text-ink">{p.name}</td>
                    <td className="px-5 py-3 text-ink-soft">{supplierNames[p.supplierId] ?? '—'}</td>
                    <td className="px-5 py-3 text-ink-soft">{categoryNames[p.categoryId] ?? '—'}</td>
                    <td className="px-5 py-3 text-ink-soft">
                      {formatMoney(p.basePriceSen)}/{p.unit}
                    </td>
                    <td className="px-5 py-3 text-ink-soft">{p.stockQty}</td>
                    <td className="px-5 py-3">
                      <Badge variant={p.isActive ? 'success' : 'secondary'}>{p.isActive ? 'Active' : 'Hidden'}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
