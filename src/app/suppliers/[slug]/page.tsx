import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, ShieldCheck, Star } from 'lucide-react';
import { PublicNavbar } from '@/components/layout/public-navbar';
import { PublicFooter } from '@/components/layout/public-footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ProductCard } from '@/components/product/product-card';
import { getSupplierBySlug, getProducts, getDeliveryZonesForSupplier } from '@/lib/data/catalogue';
import { getReviewsForSupplier } from '@/lib/data/reviews';
import { getFavourites } from '@/lib/data/favourites';
import { getSession } from '@/lib/auth/session';

export default async function SupplierStorefrontPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supplier = await getSupplierBySlug(slug);
  if (!supplier) notFound();

  const [productResult, zones, reviews, session] = await Promise.all([
    getProducts({ supplierId: supplier.id, pageSize: 48 }),
    getDeliveryZonesForSupplier(supplier.id),
    getReviewsForSupplier(supplier.id),
    getSession(),
  ]);

  const isBuyer = session?.user.role === 'buyer';
  const favourites = isBuyer && session?.buyerProfileId ? await getFavourites(session.buyerProfileId) : [];
  const favouriteProductIds = new Set(favourites.map((f) => f.productId).filter(Boolean));

  return (
    <>
      <PublicNavbar />
      <main id="main-content">
        <div className="h-40 w-full bg-gradient-to-r from-primary-600 to-primary" />
        <div className="container-app -mt-12 pb-16">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-ink">{supplier.storeName}</h1>
                  {supplier.verificationStatus === 'verified' && (
                    <ShieldCheck className="h-5 w-5 text-success" aria-label="Verified supplier" />
                  )}
                </div>
                <p className="mt-1 max-w-2xl text-sm text-ink-soft">{supplier.storeDescription}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium text-primary-700">
                    <Star className="h-4 w-4 fill-primary-700" /> {supplier.rating.toFixed(1)} ({supplier.ratingCount} ratings)
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> Delivers to {zones.length} district{zones.length === 1 ? '' : 's'}
                  </span>
                  <Badge variant="outline">Min order {(supplier.minimumOrderSen / 100).toFixed(2)} RM</Badge>
                </div>
              </div>
              {isBuyer ? (
                <MessageSupplierButton supplierId={supplier.id} />
              ) : (
                <Button asChild variant="outline">
                  <Link href="/login">Log in to order</Link>
                </Button>
              )}
            </div>
          </div>

          <section className="mt-8">
            <h2 className="text-xl font-bold text-ink">Products</h2>
            {productResult.items.length === 0 ? (
              <EmptyState className="mt-4" title="No products listed yet" description="This supplier hasn't added products yet." />
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {productResult.items.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    supplier={supplier}
                    isBuyer={isBuyer}
                    isFavourite={favouriteProductIds.has(product.id)}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="text-xl font-bold text-ink">Delivery coverage</h2>
              <div className="mt-4 space-y-2">
                {zones.map((z) => (
                  <div key={z.id} className="flex items-center justify-between rounded-lg border border-border bg-white p-3 text-sm">
                    <span className="font-medium text-ink">{z.district}</span>
                    <span className="text-muted-foreground">
                      RM {(z.deliveryFeeSen / 100).toFixed(2)} · {z.etaHoursMin}-{z.etaHoursMax}h
                      {z.freeDeliveryThresholdSen != null && ` · Free above RM ${(z.freeDeliveryThresholdSen / 100).toFixed(0)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-ink">Buyer reviews</h2>
              {reviews.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">No reviews yet.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {reviews.map((r) => (
                    <div key={r.id} className="rounded-lg border border-border bg-white p-3 text-sm">
                      <div className="flex items-center gap-1 text-primary-700">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-primary-700' : 'fill-none text-border'}`} />
                        ))}
                      </div>
                      {r.comment && <p className="mt-1 text-ink-soft">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}

function MessageSupplierButton({ supplierId }: { supplierId: string }) {
  return (
    <Button asChild variant="outline">
      <Link href={`/buyer/messages?supplierId=${supplierId}`}>Message supplier</Link>
    </Button>
  );
}
