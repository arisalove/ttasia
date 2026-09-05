'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Field } from '@/components/ui/field';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { formatMoney } from '@/lib/utils/money';
import { SABAH_DISTRICTS } from '@/lib/domain/types';
import type { ProductUnit, Quotation, QuotationStatus, SabahDistrict, SupplierProfile } from '@/lib/domain/types';

const UNITS: ProductUnit[] = ['kg', 'g', 'carton', 'tray', 'packet', 'bottle', 'bag', 'box', 'unit', 'litre'];

const STATUS_VARIANT: Record<QuotationStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  requested: 'warning',
  quoted: 'default',
  accepted: 'success',
  declined: 'destructive',
  expired: 'secondary',
  converted: 'success',
};

interface DraftItem {
  productId?: string;
  description: string;
  qty: number;
  unit: ProductUnit;
}

const CUSTOM_ITEM = '__custom__';

export function RfqManager({
  quotations,
  suppliers,
  productsBySupplier,
}: {
  quotations: Quotation[];
  suppliers: SupplierProfile[];
  /** Each supplier's catalogue products, so a buyer can optionally tie a line item to one. */
  productsBySupplier: Record<string, { id: string; name: string; unit: ProductUnit }[]>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? '');
  const [message, setMessage] = useState('');
  const [draftItems, setDraftItems] = useState<DraftItem[]>([{ description: '', qty: 1, unit: 'kg' }]);
  const [submitting, setSubmitting] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const supplierProducts = productsBySupplier[supplierId] ?? [];

  function updateItem(index: number, patch: Partial<DraftItem>) {
    setDraftItems((items) => items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function selectProductForItem(index: number, productId: string) {
    if (productId === CUSTOM_ITEM) {
      updateItem(index, { productId: undefined });
      return;
    }
    const product = supplierProducts.find((p) => p.id === productId);
    if (!product) return;
    updateItem(index, { productId: product.id, description: product.name, unit: product.unit });
  }

  function changeSupplier(nextSupplierId: string) {
    setSupplierId(nextSupplierId);
    // Product choices are supplier-specific, so start the item list over.
    setDraftItems([{ description: '', qty: 1, unit: 'kg' }]);
  }

  async function submitRfq(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierId, message, items: draftItems }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? 'Could not submit request.', 'error');
        return;
      }
      toast('Quotation request sent!', 'success');
      setOpen(false);
      setDraftItems([{ description: '', qty: 1, unit: 'kg' }]);
      setMessage('');
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function acceptQuotation(id: string, meta: { fulfilmentMethod: 'delivery' | 'pickup'; district?: SabahDistrict; deliveryAddress?: string }) {
    setAcceptingId(id);
    try {
      const res = await fetch(`/api/rfq/${id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...meta, paymentMethod: 'bank_transfer' }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.errors?.[0]?.message ?? data.error ?? 'Could not accept quotation.', 'error');
        return;
      }
      if (data.skippedItems?.length) {
        toast(
          `Order placed, but ${data.skippedItems.length} item(s) weren't linked to a catalogue product and were left out: ${data.skippedItems.join(', ')}. Message the supplier to sort these separately.`,
          'info',
        );
      } else {
        toast('Quotation accepted — order placed!', 'success');
      }
      router.push(`/buyer/order-confirmation/${data.orders[0].id}`);
    } finally {
      setAcceptingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">Request negotiated bulk pricing from any verified supplier.</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> New request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request a quotation</DialogTitle>
            </DialogHeader>
            <form onSubmit={submitRfq} className="flex flex-col gap-4">
              <Field id="rfq-supplier" label="Supplier" required>
                <Select id="rfq-supplier" value={supplierId} onChange={(e) => changeSupplier(e.target.value)}>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.storeName}</option>
                  ))}
                </Select>
              </Field>

              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-ink">Items</p>
                <p className="text-xs text-muted-foreground">
                  Pick a catalogue product where you can, so an accepted quote can convert straight into an order. Use &ldquo;Custom item&rdquo; for anything not in their catalogue — the supplier will follow up on those separately.
                </p>
                {draftItems.map((item, i) => (
                  <div key={i} className="flex flex-col gap-2 rounded-lg border border-border p-2 sm:flex-row sm:items-center sm:border-0 sm:p-0">
                    {supplierProducts.length > 0 && (
                      <Select
                        value={item.productId ?? CUSTOM_ITEM}
                        onChange={(e) => selectProductForItem(i, e.target.value)}
                        className="sm:w-44"
                        aria-label="Catalogue product"
                      >
                        <option value={CUSTOM_ITEM}>Custom item</option>
                        {supplierProducts.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </Select>
                    )}
                    <Input
                      placeholder="Description (e.g. Whole chicken, weekly)"
                      value={item.description}
                      onChange={(e) => updateItem(i, { description: e.target.value })}
                      required
                      className="flex-1"
                      disabled={!!item.productId}
                    />
                    <Input
                      type="number"
                      min={1}
                      value={item.qty}
                      onChange={(e) => updateItem(i, { qty: Number(e.target.value) })}
                      className="w-20"
                      aria-label="Quantity"
                    />
                    <Select
                      value={item.unit}
                      onChange={(e) => updateItem(i, { unit: e.target.value as ProductUnit })}
                      className="w-28"
                      aria-label="Unit"
                      disabled={!!item.productId}
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </Select>
                    <button
                      type="button"
                      onClick={() => setDraftItems((items) => items.filter((_, idx) => idx !== i))}
                      disabled={draftItems.length === 1}
                      className="tap-target flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-muted disabled:opacity-30"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="self-start"
                  onClick={() => setDraftItems((items) => [...items, { description: '', qty: 1, unit: 'kg' }])}
                >
                  <Plus className="h-3.5 w-3.5" /> Add item
                </Button>
              </div>

              <Field id="rfq-message" label="Message to supplier">
                <Textarea id="rfq-message" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell the supplier about volume, frequency, or delivery needs…" />
              </Field>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" loading={submitting} disabled={!supplierId}>
                  Send request
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {quotations.length === 0 ? (
        <EmptyState title="No quotation requests yet" description="Request bulk pricing from a supplier for recurring or large orders." />
      ) : (
        <div className="flex flex-col gap-4">
          {quotations.map((q) => (
            <QuotationCard key={q.id} quotation={q} onAccept={acceptQuotation} accepting={acceptingId === q.id} />
          ))}
        </div>
      )}
    </div>
  );
}

function QuotationCard({
  quotation,
  onAccept,
  accepting,
}: {
  quotation: Quotation;
  onAccept: (id: string, meta: { fulfilmentMethod: 'delivery' | 'pickup'; district?: SabahDistrict; deliveryAddress?: string }) => void;
  accepting: boolean;
}) {
  const [fulfilmentMethod, setFulfilmentMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [district, setDistrict] = useState<SabahDistrict>('Tawau');
  const [address, setAddress] = useState('');

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold text-ink">{quotation.quotationNumber}</p>
          <Badge variant={STATUS_VARIANT[quotation.status]} className="capitalize">{quotation.status}</Badge>
        </div>
        <ul className="mt-3 space-y-1 text-sm text-ink-soft">
          {quotation.items.map((item) => (
            <li key={item.id}>
              {item.qty} {item.unit} — {item.description}
              {item.proposedPriceSen != null && <span className="ml-2 font-medium text-ink">{formatMoney(item.proposedPriceSen)}/{item.unit}</span>}
            </li>
          ))}
        </ul>
        {quotation.message && <p className="mt-2 text-sm italic text-muted-foreground">&ldquo;{quotation.message}&rdquo;</p>}
        {quotation.supplierResponse && (
          <div className="mt-3 rounded-lg bg-surface-muted p-3 text-sm">
            <p className="font-medium text-ink">Supplier response</p>
            <p className="text-ink-soft">{quotation.supplierResponse}</p>
            {quotation.totalSen != null && <p className="mt-1 font-bold text-ink">Total: {formatMoney(quotation.totalSen)}</p>}
          </div>
        )}

        {quotation.status === 'quoted' && (
          <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-end">
            <Field id={`fulfil-${quotation.id}`} label="Fulfilment" className="flex-1">
              <Select id={`fulfil-${quotation.id}`} value={fulfilmentMethod} onChange={(e) => setFulfilmentMethod(e.target.value as 'delivery' | 'pickup')}>
                <option value="delivery">Delivery</option>
                <option value="pickup">Self-pickup</option>
              </Select>
            </Field>
            {fulfilmentMethod === 'delivery' && (
              <>
                <Field id={`district-${quotation.id}`} label="District" className="flex-1">
                  <Select id={`district-${quotation.id}`} value={district} onChange={(e) => setDistrict(e.target.value as SabahDistrict)}>
                    {SABAH_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </Select>
                </Field>
                <Field id={`addr-${quotation.id}`} label="Address" className="flex-1">
                  <Input id={`addr-${quotation.id}`} value={address} onChange={(e) => setAddress(e.target.value)} />
                </Field>
              </>
            )}
            <Button
              loading={accepting}
              onClick={() => onAccept(quotation.id, { fulfilmentMethod, district: fulfilmentMethod === 'delivery' ? district : undefined, deliveryAddress: address })}
            >
              Accept & place order
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
