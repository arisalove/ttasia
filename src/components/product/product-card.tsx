'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { formatMoney } from '@/lib/utils/money';
import { cn } from '@/lib/utils/cn';
import type { Product, SupplierProfile } from '@/lib/domain/types';

export function ProductCard({
  product,
  supplier,
  isBuyer,
  isFavourite,
}: {
  product: Product;
  supplier?: Pick<SupplierProfile, 'storeName' | 'storeSlug'>;
  isBuyer: boolean;
  isFavourite?: boolean;
}) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [fav, setFav] = useState(!!isFavourite);
  const image = product.images[0]?.url;
  const outOfStock = product.stockQty <= 0;

  function addToCart() {
    startTransition(async () => {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, qty: product.minOrderQty }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? 'Could not add to cart.', 'error');
        return;
      }
      toast(`Added ${product.minOrderQty} ${product.unit} of ${product.name} to your cart.`, 'success');
    });
  }

  function toggleFavourite() {
    startTransition(async () => {
      const res = await fetch('/api/favourites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? 'Could not update favourites.', 'error');
        return;
      }
      setFav(data.active);
    });
  }

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link href={`/buyer/product/${product.id}`} className="relative block aspect-[4/3] w-full overflow-hidden bg-surface-muted">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/50">
            <Badge variant="destructive">Out of stock</Badge>
          </div>
        )}
        {isBuyer && (
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFavourite();
            }}
            aria-pressed={fav}
            aria-label={fav ? 'Remove from favourites' : 'Add to favourites'}
            className="tap-target absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white"
          >
            <Heart className={cn('h-4 w-4', fav ? 'fill-primary text-primary' : 'text-ink-soft')} />
          </button>
        )}
      </Link>
      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        {supplier && (
          <p className="truncate text-xs font-medium text-muted-foreground">{supplier.storeName}</p>
        )}
        <Link href={`/buyer/product/${product.id}`} className="line-clamp-2 min-h-[2.5rem] font-semibold text-ink hover:underline">
          {product.name}
        </Link>
        <div className="flex flex-wrap items-center gap-1.5">
          {product.isHalal && (
            <Badge variant="success" className="text-[10px]">Halal</Badge>
          )}
          <Badge variant="outline" className="text-[10px]">Min {product.minOrderQty} {product.unit}</Badge>
        </div>
        <div className="mt-auto flex items-end justify-between pt-1">
          <div>
            <p className="price text-lg">{formatMoney(product.basePriceSen)}</p>
            <p className="text-xs text-muted-foreground">per {product.unit} · {product.packSize}</p>
          </div>
          {isBuyer && (
            <Button size="icon" variant="secondary" onClick={addToCart} disabled={outOfStock || pending} aria-label="Add to cart">
              <Plus className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
