import { CartView } from '@/components/cart/cart-view';
import { getSession } from '@/lib/auth/session';
import { getCartItems } from '@/lib/data/cart';
import { getProductById, getSuppliers } from '@/lib/data/catalogue';
import type { Product, SupplierProfile } from '@/lib/domain/types';

export default async function CartPage() {
  const session = await getSession();
  const buyerId = session!.buyerProfileId!;
  const items = await getCartItems(buyerId);

  const uniqueProductIds = Array.from(new Set(items.map((i) => i.productId)));
  const [productList, allSuppliers] = await Promise.all([
    Promise.all(uniqueProductIds.map((id) => getProductById(id))),
    getSuppliers(),
  ]);

  const products: Record<string, Product> = {};
  productList.forEach((p) => {
    if (p) products[p.id] = p;
  });
  const suppliers: Record<string, SupplierProfile> = {};
  allSuppliers.forEach((s) => {
    suppliers[s.id] = s;
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Your cart</h1>
      <CartView initialItems={items} products={products} suppliers={suppliers} />
    </div>
  );
}
