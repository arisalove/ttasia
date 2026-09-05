import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { ProductCard } from '@/components/product/product-card';
import { getSession } from '@/lib/auth/session';
import { getFavourites } from '@/lib/data/favourites';
import { getProductById, getSuppliers } from '@/lib/data/catalogue';

export default async function FavouritesPage() {
  const session = await getSession();
  const buyerId = session!.buyerProfileId!;
  const favourites = await getFavourites(buyerId);

  const productFavIds = favourites.map((f) => f.productId).filter((id): id is string => !!id);
  const supplierFavIds = favourites.map((f) => f.supplierId).filter((id): id is string => !!id);

  const [products, allSuppliers] = await Promise.all([
    Promise.all(productFavIds.map((id) => getProductById(id))),
    getSuppliers(),
  ]);
  const favouriteSuppliers = allSuppliers.filter((s) => supplierFavIds.includes(s.id));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Favourites</h1>
        <p className="text-muted-foreground">Products and suppliers you&apos;ve saved for quick reordering.</p>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-bold text-ink">Favourite products</h2>
        {products.filter(Boolean).length === 0 ? (
          <EmptyState icon={<Heart />} title="No favourite products yet" description="Tap the heart icon on any product to save it here." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.filter(Boolean).map((product) => (
              <ProductCard key={product!.id} product={product!} isBuyer isFavourite />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-ink">Favourite suppliers</h2>
        {favouriteSuppliers.length === 0 ? (
          <EmptyState icon={<Heart />} title="No favourite suppliers yet" description="Save suppliers you buy from often." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {favouriteSuppliers.map((s) => (
              <Link key={s.id} href={`/suppliers/${s.storeSlug}`} className="flex items-center justify-between rounded-xl border border-border bg-white p-4 hover:shadow-md">
                <div>
                  <p className="font-semibold text-ink">{s.storeName}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-primary-700 text-primary-700" /> {s.rating.toFixed(1)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
