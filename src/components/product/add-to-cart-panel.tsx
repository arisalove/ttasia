'use client';

import { useMemo, useState, useTransition } from 'react';
import { Minus, Plus, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { resolveUnitPriceSen } from '@/lib/domain/pricing';
import { formatMoney } from '@/lib/utils/money';
import { cn } from '@/lib/utils/cn';
import type { Product } from '@/lib/domain/types';

export function AddToCartPanel({ product, isFavourite }: { product: Product; isFavourite: boolean }) {
  const { toast } = useToast();
  const [qty, setQty] = useState(product.minOrderQty);
  const [fav, setFav] = useState(isFavourite);
  const [pending, startTransition] = useTransition();

  const unitPriceSen = useMemo(() => resolveUnitPriceSen(product, qty), [product, qty]);
  const lineTotalSen = Math.round(unitPriceSen * qty);
  const outOfStock = product.stockQty <= 0;

  function clamp(next: number) {
    return Math.max(product.minOrderQty, Math.min(product.stockQty, next));
  }

  function addToCart() {
    startTransition(async () => {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, qty }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? 'Could not add to cart.', 'error');
        return;
      }
      toast(`Added ${qty} ${product.unit} to your cart.`, 'success');
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
      if (res.ok) setFav(data.active);
    });
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      {product.priceTiers.length > 0 && (
        <div className="mb-4 space-y-1 rounded-lg bg-surface-muted p-3 text-sm">
          <p className="mb-1 font-semibold text-ink">Wholesale pricing</p>
          {product.priceTiers.map((tier) => (
            <div key={tier.id} className="flex justify-between text-ink-soft">
              <span>{tier.maxQty != null ? `${tier.minQty}-${tier.maxQty}` : `${tier.minQty}+`} {product.unit}</span>
              <span className="font-medium text-ink">{formatMoney(tier.pricePerUnitSen)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink">Quantity ({product.unit})</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQty((q) => clamp(q - 1))}
            className="tap-target flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-surface-muted disabled:opacity-40"
            disabled={qty <= product.minOrderQty}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            type="number"
            className="w-16 rounded-lg border border-border py-1.5 text-center text-sm"
            value={qty}
            min={product.minOrderQty}
            max={product.stockQty}
            onChange={(e) => setQty(clamp(Number(e.target.value) || product.minOrderQty))}
            aria-label="Quantity"
          />
          <button
            type="button"
            onClick={() => setQty((q) => clamp(q + 1))}
            className="tap-target flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-surface-muted disabled:opacity-40"
            disabled={qty >= product.stockQty}
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Minimum order {product.minOrderQty} {product.unit} · {product.stockQty} {product.unit} in stock
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="price text-2xl">{formatMoney(lineTotalSen)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFavourite}
            aria-pressed={fav}
            aria-label={fav ? 'Remove from favourites' : 'Add to favourites'}
            className="tap-target flex h-11 w-11 items-center justify-center rounded-full border border-border hover:bg-surface-muted"
          >
            <Heart className={cn('h-5 w-5', fav ? 'fill-primary text-primary' : 'text-ink-soft')} />
          </button>
          <Button onClick={addToCart} loading={pending} disabled={outOfStock} size="lg">
            {outOfStock ? 'Out of stock' : 'Add to cart'}
          </Button>
        </div>
      </div>
    </div>
  );
}
