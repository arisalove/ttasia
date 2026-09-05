import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, ShieldCheck, Star, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AddToCartPanel } from '@/components/product/add-to-cart-panel';
import { getProductById } from '@/lib/data/catalogue';
import { getSession } from '@/lib/auth/session';
import { getFavourites } from '@/lib/data/favourites';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const session = await getSession();
  const favourites = session?.buyerProfileId ? await getFavourites(session.buyerProfileId) : [];
  const isFavourite = favourites.some((f) => f.productId === product.id);

  const supplier = product.supplier;
  const image = product.images[0]?.url;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-surface-muted">
        {image ? (
          <Image src={image} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">No image available</div>
        )}
      </div>

      <div>
        {supplier && (
          <Link href={`/suppliers/${supplier.storeSlug}`} className="flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:underline">
            {supplier.storeName}
            {supplier.verificationStatus === 'verified' && <ShieldCheck className="h-4 w-4" />}
          </Link>
        )}
        <h1 className="mt-1 text-2xl font-extrabold text-ink">{product.name}</h1>
        {product.nameMs && <p className="text-sm text-muted-foreground">{product.nameMs}</p>}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {product.isHalal && <Badge variant="success">Halal</Badge>}
          <Badge variant="outline">{product.packSize}</Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Prep {product.prepTimeHours}h
          </Badge>
        </div>

        <p className="mt-4 text-ink-soft">{product.description}</p>

        <div className="mt-6">
          <AddToCartPanel product={product} isFavourite={isFavourite} />
        </div>

        {supplier && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-surface-warm p-4">
            <div>
              <p className="text-sm font-semibold text-ink">Questions about this product?</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-primary-700 text-primary-700" /> {supplier.rating.toFixed(1)} rating from {supplier.ratingCount} orders
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/buyer/messages?supplierId=${supplier.id}`}>
                <MessageCircle className="h-4 w-4" /> Message
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
