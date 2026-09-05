import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ProductActiveToggle } from '@/components/supplier/product-active-toggle';
import { getSession } from '@/lib/auth/session';
import { getProductsForSupplier } from '@/lib/data/suppliers';
import { getCategories } from '@/lib/data/catalogue';
import { formatMoney } from '@/lib/utils/money';

export default async function SupplierProductsPage() {
  const session = await getSession();
  const [products, categories] = await Promise.all([
    getProductsForSupplier(session!.supplierProfileId!),
    getCategories(),
  ]);
  const categoryNames = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink">Products</h1>
        <Button asChild size="sm">
          <Link href="/supplier/products/new">
            <Plus className="h-4 w-4" /> Add product
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Add your first product so buyers can start ordering from you."
          action={
            <Button asChild size="sm">
              <Link href="/supplier/products/new">Add product</Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium text-ink">{p.name}</td>
                  <td className="px-4 py-3 text-ink-soft">{categoryNames[p.categoryId] ?? '—'}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {formatMoney(p.basePriceSen)} / {p.unit}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{p.stockQty}</td>
                  <td className="px-4 py-3">
                    <ProductActiveToggle productId={p.id} isActive={p.isActive} />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/supplier/products/${p.id}/edit`} className="font-semibold text-primary hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
