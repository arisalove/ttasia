'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import type { Category, Product, ProductUnit } from '@/lib/domain/types';

const UNITS: ProductUnit[] = ['kg', 'g', 'carton', 'tray', 'packet', 'bottle', 'bag', 'box', 'unit', 'litre'];

interface TierDraft {
  minQty: string;
  maxQty: string;
  priceRm: string;
}

export function ProductForm({ categories, product }: { categories: Category[]; product?: Product }) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(product?.name ?? '');
  const [nameMs, setNameMs] = useState(product?.nameMs ?? '');
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [unit, setUnit] = useState<ProductUnit>(product?.unit ?? 'kg');
  const [packSize, setPackSize] = useState(product?.packSize ?? '');
  const [basePriceRm, setBasePriceRm] = useState(product ? (product.basePriceSen / 100).toFixed(2) : '');
  const [stockQty, setStockQty] = useState(String(product?.stockQty ?? 0));
  const [minOrderQty, setMinOrderQty] = useState(String(product?.minOrderQty ?? 1));
  const [prepTimeHours, setPrepTimeHours] = useState(String(product?.prepTimeHours ?? 24));
  const [isHalal, setIsHalal] = useState(product?.isHalal ?? true);
  const [imageUrl, setImageUrl] = useState(product?.images?.[0]?.url ?? '');
  const [tiers, setTiers] = useState<TierDraft[]>(
    product?.priceTiers?.length
      ? product.priceTiers.map((t) => ({ minQty: String(t.minQty), maxQty: t.maxQty ? String(t.maxQty) : '', priceRm: (t.pricePerUnitSen / 100).toFixed(2) }))
      : [],
  );

  function addTier() {
    setTiers((prev) => [...prev, { minQty: '', maxQty: '', priceRm: '' }]);
  }
  function updateTier(index: number, patch: Partial<TierDraft>) {
    setTiers((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }
  function removeTier(index: number) {
    setTiers((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const basePriceSen = Math.round(parseFloat(basePriceRm || '0') * 100);
    if (!basePriceSen || basePriceSen <= 0) {
      setError('Enter a valid base price.');
      return;
    }

    const parsedTiers = tiers
      .filter((t) => t.minQty && t.priceRm)
      .map((t) => ({
        minQty: Number(t.minQty),
        maxQty: t.maxQty ? Number(t.maxQty) : undefined,
        pricePerUnitSen: Math.round(parseFloat(t.priceRm) * 100),
      }));

    setSaving(true);
    try {
      const res = await fetch('/api/supplier/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product?.id,
          categoryId,
          name,
          nameMs: nameMs || undefined,
          description,
          unit,
          packSize,
          basePriceSen,
          stockQty: Number(stockQty),
          minOrderQty: Number(minOrderQty),
          prepTimeHours: Number(prepTimeHours),
          isHalal,
          imageUrl: imageUrl || undefined,
          tiers: parsedTiers.length ? parsedTiers : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not save product.');
        return;
      }
      toast(product ? 'Product updated.' : 'Product added to your catalogue.', 'success');
      router.push('/supplier/products');
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="name" label="Product name" required>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
            <Field id="nameMs" label="Product name (Bahasa Melayu)" hint="Optional">
              <Input id="nameMs" value={nameMs} onChange={(e) => setNameMs(e.target.value)} />
            </Field>
          </div>
          <Field id="categoryId" label="Category" required>
            <Select id="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="description" label="Description" required>
            <Textarea id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="imageUrl" label="Image URL" hint="Paste a product photo URL">
              <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            </Field>
            <Field id="isHalal" label="Halal certified">
              <div className="flex h-11 items-center gap-2">
                <input id="isHalal" type="checkbox" checked={isHalal} onChange={(e) => setIsHalal(e.target.checked)} className="h-4 w-4 rounded border-input" />
                <label htmlFor="isHalal" className="text-sm text-ink-soft">
                  This product is halal-certified
                </label>
              </div>
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing &amp; stock</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="basePriceRm" label="Base price (RM)" required hint="Standard price per unit">
              <Input id="basePriceRm" type="number" min={0} step="0.01" value={basePriceRm} onChange={(e) => setBasePriceRm(e.target.value)} required />
            </Field>
            <Field id="unit" label="Unit" required>
              <Select id="unit" value={unit} onChange={(e) => setUnit(e.target.value as ProductUnit)}>
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </Field>
            <Field id="packSize" label="Pack size" required hint='e.g. "5kg bag"'>
              <Input id="packSize" value={packSize} onChange={(e) => setPackSize(e.target.value)} required />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="stockQty" label="Stock quantity" required>
              <Input id="stockQty" type="number" min={0} value={stockQty} onChange={(e) => setStockQty(e.target.value)} required />
            </Field>
            <Field id="minOrderQty" label="Minimum order quantity" required>
              <Input id="minOrderQty" type="number" min={1} value={minOrderQty} onChange={(e) => setMinOrderQty(e.target.value)} required />
            </Field>
            <Field id="prepTimeHours" label="Prep time (hours)" required>
              <Input id="prepTimeHours" type="number" min={0} value={prepTimeHours} onChange={(e) => setPrepTimeHours(e.target.value)} required />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Wholesale price tiers</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addTier}>
            <Plus className="h-4 w-4" /> Add tier
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {tiers.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No tiers yet — buyers pay the base price regardless of quantity. Add tiers to offer bulk discounts.
            </p>
          )}
          {tiers.map((tier, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2 rounded-lg border border-border p-3">
              <Field id={`tier-min-${i}`} label="Min qty">
                <Input id={`tier-min-${i}`} type="number" min={1} value={tier.minQty} onChange={(e) => updateTier(i, { minQty: e.target.value })} />
              </Field>
              <Field id={`tier-max-${i}`} label="Max qty" hint="Optional">
                <Input id={`tier-max-${i}`} type="number" min={1} value={tier.maxQty} onChange={(e) => updateTier(i, { maxQty: e.target.value })} />
              </Field>
              <Field id={`tier-price-${i}`} label="Price/unit (RM)">
                <Input id={`tier-price-${i}`} type="number" min={0} step="0.01" value={tier.priceRm} onChange={(e) => updateTier(i, { priceRm: e.target.value })} />
              </Field>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeTier(i)} aria-label="Remove tier">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" loading={saving}>
          {product ? 'Save changes' : 'Add product'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/supplier/products')}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
