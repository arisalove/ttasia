import { InventoryTable } from '@/components/supplier/inventory-table';
import { EmptyState } from '@/components/ui/empty-state';
import { getSession } from '@/lib/auth/session';
import { getProductsForSupplier } from '@/lib/data/suppliers';
import { getCategories } from '@/lib/data/catalogue';

export default async function SupplierInventoryPage() {
  const session = await getSession();
  const [products, categories] = await Promise.all([
    getProductsForSupplier(session!.supplierProfileId!),
    getCategories(),
  ]);
  const categoryNames = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Inventory &amp; availability</h1>
        <p className="text-sm text-muted-foreground">Keep stock levels up to date so buyers see accurate availability.</p>
      </div>
      {products.length === 0 ? (
        <EmptyState title="No products yet" description="Add products first to manage their stock here." />
      ) : (
        <InventoryTable products={products} categoryNames={categoryNames} />
      )}
    </div>
  );
}
