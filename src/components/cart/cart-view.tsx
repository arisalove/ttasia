'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Minus, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { groupCartBySupplier, checkMinimumOrders, canProceedToCheckout } from '@/lib/domain/cart';
import { lineTotalSen } from '@/lib/domain/pricing';
import { formatMoney, sumSen } from '@/lib/utils/money';
import type { CartItem, Product, SupplierProfile } from '@/lib/domain/types';

export function CartView({
  initialItems,
  products,
  suppliers,
}: {
  initialItems: CartItem[];
  products: Record<string, Product>;
  suppliers: Record<string, SupplierProfile>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState(initialItems);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const groups = useMemo(() => groupCartBySupplier(items), [items]);
  const minimumOrderBySupplier = useMemo(
    () => Object.fromEntries(groups.map((g) => [g.supplierId, suppliers[g.supplierId]?.minimumOrderSen ?? 0])),
    [groups, suppliers],
  );
  const moqResults = useMemo(() => checkMinimumOrders(groups, minimumOrderBySupplier), [groups, minimumOrderBySupplier]);
  const canCheckout = canProceedToCheckout(moqResults);
  const grandTotalSen = sumSen(items.map((i) => lineTotalSen(i.unitPriceSen, i.qty)));

  function updateQty(item: CartItem, qty: number) {
    if (qty <= 0) return removeItem(item);
    setPendingId(item.id);
    startTransition(async () => {
      const res = await fetch(`/api/cart/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qty }),
      });
      const data = await res.json();
      setPendingId(null);
      if (!res.ok) {
        toast(data.error ?? 'Could not update quantity.', 'error');
        return;
      }
      setItems(data.items);
    });
  }

  function removeItem(item: CartItem) {
    setPendingId(item.id);
    startTransition(async () => {
      const res = await fetch(`/api/cart/items/${item.id}`, { method: 'DELETE' });
      const data = await res.json();
      setPendingId(null);
      if (!res.ok) {
        toast(data.error ?? 'Could not remove item.', 'error');
        return;
      }
      setItems(data.items);
      toast('Removed from cart.', 'info');
    });
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Browse the catalogue and add products from any supplier."
        action={
          <Button asChild size="sm">
            <Link href="/buyer/catalogue">Browse catalogue</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        {groups.map((group) => {
          const supplier = suppliers[group.supplierId];
          const moq = moqResults.find((r) => r.supplierId === group.supplierId)!;
          return (
            <div key={group.supplierId} className="rounded-xl border border-border bg-white">
              <div className="flex items-center justify-between border-b border-border p-4">
                <p className="font-semibold text-ink">{supplier?.storeName ?? 'Supplier'}</p>
                <p className="text-sm text-muted-foreground">{formatMoney(group.subtotalSen)}</p>
              </div>
              <div className="divide-y divide-border">
                {group.items.map((item) => {
                  const product = products[item.productId];
                  if (!product) return null;
                  return (
                    <div key={item.id} className="flex items-center gap-3 p-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                        {product.images[0] && (
                          <Image src={product.images[0].url} alt={product.name} fill sizes="64px" className="object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link href={`/buyer/product/${product.id}`} className="line-clamp-1 font-medium text-ink hover:underline">
                          {product.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{formatMoney(item.unitPriceSen)} / {product.unit}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQty(item, item.qty - 1)}
                          disabled={pendingId === item.id}
                          className="tap-target flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-surface-muted"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item, item.qty + 1)}
                          disabled={pendingId === item.id || item.qty >= product.stockQty}
                          className="tap-target flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-surface-muted"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="w-20 text-right text-sm font-semibold text-ink">
                        {formatMoney(lineTotalSen(item.unitPriceSen, item.qty))}
                      </p>
                      <button
                        onClick={() => removeItem(item)}
                        disabled={pendingId === item.id}
                        className="tap-target flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
              {!moq.meetsMinimum && (
                <div className="flex items-center gap-2 border-t border-warning/30 bg-warning/10 p-3 text-sm text-warning">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Add {formatMoney(moq.shortfallSen)} more to meet this supplier&apos;s {formatMoney(moq.minimumOrderSen)} minimum order.
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="h-fit rounded-xl border border-border bg-white p-5">
        <h2 className="mb-3 font-bold text-ink">Order summary</h2>
        <div className="space-y-2 text-sm">
          {groups.map((g) => (
            <div key={g.supplierId} className="flex justify-between text-muted-foreground">
              <span>{suppliers[g.supplierId]?.storeName ?? 'Supplier'}</span>
              <span>{formatMoney(g.subtotalSen)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-3 font-bold text-ink">
          <span>Subtotal</span>
          <span>{formatMoney(grandTotalSen)}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Delivery fees calculated at checkout, per supplier.</p>
        <Button className="mt-4 w-full" size="lg" disabled={!canCheckout} onClick={() => router.push('/buyer/checkout')}>
          Proceed to checkout
        </Button>
        {!canCheckout && <p className="mt-2 text-xs text-warning">Resolve minimum-order warnings above to continue.</p>}
      </div>
    </div>
  );
}
