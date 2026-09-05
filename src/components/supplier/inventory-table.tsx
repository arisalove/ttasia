'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import type { Product } from '@/lib/domain/types';

export function InventoryTable({ products, categoryNames }: { products: Product[]; categoryNames: Record<string, string> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<Record<string, string>>(Object.fromEntries(products.map((p) => [p.id, String(p.stockQty)])));
  const [savingId, setSavingId] = useState<string | null>(null);

  async function saveStock(productId: string) {
    const stockQty = Number(drafts[productId]);
    if (Number.isNaN(stockQty) || stockQty < 0) {
      toast('Enter a valid stock quantity.', 'error');
      return;
    }
    setSavingId(productId);
    try {
      const res = await fetch(`/api/supplier/products/${productId}/active`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQty }),
      });
      if (!res.ok) {
        toast('Could not update stock.', 'error');
        return;
      }
      toast('Stock updated.', 'success');
      router.refresh();
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-medium">Product</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Min order qty</th>
            <th className="px-4 py-3 font-medium">Stock on hand</th>
            <th className="px-4 py-3 font-medium">Save</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {products.map((p) => {
            const low = Number(drafts[p.id]) <= 5;
            return (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium text-ink">{p.name}</td>
                <td className="px-4 py-3 text-ink-soft">{categoryNames[p.categoryId] ?? '—'}</td>
                <td className="px-4 py-3 text-ink-soft">
                  {p.minOrderQty} {p.unit}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      className="h-9 w-24"
                      value={drafts[p.id]}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [p.id]: e.target.value }))}
                    />
                    {low && <Badge variant="warning">Low</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Button size="icon" variant="outline" onClick={() => saveStock(p.id)} loading={savingId === p.id} aria-label="Save stock">
                    <Check className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
