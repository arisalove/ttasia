'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, Store, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Field } from '@/components/ui/field';
import { useToast } from '@/components/ui/toast';
import { groupCartBySupplier, resolveDeliveryFeeSen } from '@/lib/domain/cart';
import { lineTotalSen } from '@/lib/domain/pricing';
import { formatMoney, sumSen } from '@/lib/utils/money';
import { SABAH_DISTRICTS } from '@/lib/domain/types';
import type { CartItem, DeliveryZone, FulfilmentMethod, PaymentMethod, SabahDistrict, SupplierProfile } from '@/lib/domain/types';

export function CheckoutForm({
  items,
  suppliers,
  zonesBySupplier,
  businessAddress,
  defaultDistrict,
}: {
  items: CartItem[];
  suppliers: Record<string, SupplierProfile>;
  zonesBySupplier: Record<string, DeliveryZone[]>;
  businessAddress: string;
  defaultDistrict?: SabahDistrict;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [fulfilmentMethod, setFulfilmentMethod] = useState<FulfilmentMethod>('delivery');
  const [district, setDistrict] = useState<SabahDistrict>(defaultDistrict ?? 'Tawau');
  const [deliveryAddress, setDeliveryAddress] = useState(businessAddress);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const groups = useMemo(() => groupCartBySupplier(items), [items]);

  const groupBreakdown = useMemo(
    () =>
      groups.map((g) => {
        const { feeSen, districtCovered } = resolveDeliveryFeeSen(fulfilmentMethod, district, g.subtotalSen, zonesBySupplier[g.supplierId] ?? []);
        return { ...g, feeSen, districtCovered, totalSen: g.subtotalSen + feeSen };
      }),
    [groups, fulfilmentMethod, district, zonesBySupplier],
  );

  const subtotalSen = sumSen(items.map((i) => lineTotalSen(i.unitPriceSen, i.qty)));
  const deliveryFeeSen = sumSen(groupBreakdown.map((g) => g.feeSen));
  const grandTotalSen = subtotalSen + deliveryFeeSen;
  const uncoveredSuppliers = groupBreakdown.filter((g) => fulfilmentMethod === 'delivery' && !g.districtCovered);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (uncoveredSuppliers.length > 0) {
      setFormError('One or more suppliers do not deliver to the selected district. Switch district or choose self-pickup.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fulfilmentMethod,
          district: fulfilmentMethod === 'delivery' ? district : undefined,
          deliveryAddress: fulfilmentMethod === 'delivery' ? deliveryAddress : undefined,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.errors?.map((e: { message: string }) => e.message).join(' ') ?? data.error ?? 'Checkout failed.');
        return;
      }
      const orderIds: string[] = data.orders.map((o: { id: string }) => o.id);
      toast(`Placed ${orderIds.length} order${orderIds.length > 1 ? 's' : ''}!`, 'success');
      const [first, ...rest] = orderIds;
      const qs = rest.length ? `?also=${rest.join(',')}` : '';
      router.push(`/buyer/order-confirmation/${first}${qs}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <fieldset className="rounded-xl border border-border bg-white p-5">
          <legend className="px-1 font-bold text-ink">Fulfilment</legend>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFulfilmentMethod('delivery')}
              className={`tap-target flex items-center justify-center gap-2 rounded-lg border-2 p-4 text-sm font-medium ${fulfilmentMethod === 'delivery' ? 'border-primary bg-primary-50 text-primary-700' : 'border-border text-ink-soft'}`}
            >
              <Truck className="h-4 w-4" /> Delivery
            </button>
            <button
              type="button"
              onClick={() => setFulfilmentMethod('pickup')}
              className={`tap-target flex items-center justify-center gap-2 rounded-lg border-2 p-4 text-sm font-medium ${fulfilmentMethod === 'pickup' ? 'border-primary bg-primary-50 text-primary-700' : 'border-border text-ink-soft'}`}
            >
              <Store className="h-4 w-4" /> Self-pickup
            </button>
          </div>

          {fulfilmentMethod === 'delivery' && (
            <div className="mt-4 flex flex-col gap-4">
              <Field id="district" label="Delivery district" required>
                <Select id="district" value={district} onChange={(e) => setDistrict(e.target.value as SabahDistrict)}>
                  {SABAH_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </Select>
              </Field>
              <Field id="address" label="Delivery address" required>
                <Textarea id="address" rows={2} value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} required />
              </Field>
            </div>
          )}
        </fieldset>

        <fieldset className="rounded-xl border border-border bg-white p-5">
          <legend className="px-1 font-bold text-ink">Payment method</legend>
          <div className="mt-2 grid gap-2">
            {(
              [
                { value: 'bank_transfer', label: 'Bank transfer (upload receipt after placing order)' },
                { value: 'cod', label: 'Cash on delivery' },
                { value: 'cop', label: 'Cash on pickup' },
              ] as { value: PaymentMethod; label: string }[]
            )
              .filter((opt) => (fulfilmentMethod === 'pickup' ? opt.value !== 'cod' : opt.value !== 'cop'))
              .map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={opt.value}
                    checked={paymentMethod === opt.value}
                    onChange={() => setPaymentMethod(opt.value)}
                    className="h-4 w-4 accent-primary"
                  />
                  {opt.label}
                </label>
              ))}
          </div>
          <p className="mt-3 rounded-lg bg-surface-muted p-3 text-xs text-muted-foreground">
            Demo mode: this is a simulation. No real payment is processed, and TapTap never claims a charge has gone
            through — bank transfers are verified manually by the supplier from an uploaded receipt.
          </p>
        </fieldset>

        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="mb-3 font-bold text-ink">Your cart will become {groupBreakdown.length} separate order{groupBreakdown.length === 1 ? '' : 's'}</h2>
          <div className="space-y-3">
            {groupBreakdown.map((g) => (
              <div key={g.supplierId} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                <span className="font-medium text-ink">{suppliers[g.supplierId]?.storeName}</span>
                <div className="text-right">
                  <p className="text-ink">{formatMoney(g.totalSen)}</p>
                  {fulfilmentMethod === 'delivery' && !g.districtCovered && (
                    <p className="flex items-center gap-1 text-xs text-destructive"><AlertCircle className="h-3 w-3" /> Doesn&apos;t deliver here</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="h-fit rounded-xl border border-border bg-white p-5">
        <h2 className="mb-3 font-bold text-ink">Total</h2>
        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(subtotalSen)}</span></div>
          <div className="flex justify-between"><span>Delivery fees</span><span>{formatMoney(deliveryFeeSen)}</span></div>
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-3 font-bold text-ink">
          <span>Grand total</span>
          <span>{formatMoney(grandTotalSen)}</span>
        </div>
        {formError && <p role="alert" className="mt-3 text-sm font-medium text-destructive">{formError}</p>}
        <Button type="submit" size="lg" className="mt-4 w-full" loading={submitting}>
          Place order{groupBreakdown.length > 1 ? 's' : ''}
        </Button>
      </div>
    </form>
  );
}
