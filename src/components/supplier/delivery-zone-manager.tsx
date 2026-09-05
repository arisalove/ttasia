'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Field } from '@/components/ui/field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { SABAH_DISTRICTS } from '@/lib/domain/types';
import type { DeliveryZone, SabahDistrict } from '@/lib/domain/types';
import { formatMoney } from '@/lib/utils/money';

export function DeliveryZoneManager({ zones }: { zones: DeliveryZone[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [district, setDistrict] = useState<SabahDistrict>('Tawau');
  const [feeRm, setFeeRm] = useState('0');
  const [freeThresholdRm, setFreeThresholdRm] = useState('');
  const [etaMin, setEtaMin] = useState('4');
  const [etaMax, setEtaMax] = useState('24');
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const coveredDistricts = new Set(zones.map((z) => z.district));

  async function addZone() {
    setSaving(true);
    try {
      const res = await fetch('/api/supplier/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district,
          deliveryFeeSen: Math.round(parseFloat(feeRm || '0') * 100),
          freeDeliveryThresholdSen: freeThresholdRm ? Math.round(parseFloat(freeThresholdRm) * 100) : undefined,
          etaHoursMin: Number(etaMin),
          etaHoursMax: Number(etaMax),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? 'Could not add delivery zone.', 'error');
        return;
      }
      toast('Delivery zone added.', 'success');
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function removeZone(id: string) {
    setRemovingId(id);
    try {
      const res = await fetch(`/api/supplier/zones/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        toast('Could not remove this zone.', 'error');
        return;
      }
      toast('Delivery zone removed.', 'success');
      router.refresh();
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Add a district</CardTitle>
          {!open && (
            <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Add zone
            </Button>
          )}
        </CardHeader>
        {open && (
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="zone-district" label="District" required>
                <Select id="zone-district" value={district} onChange={(e) => setDistrict(e.target.value as SabahDistrict)}>
                  {SABAH_DISTRICTS.map((d) => (
                    <option key={d} value={d} disabled={coveredDistricts.has(d)}>
                      {d} {coveredDistricts.has(d) ? '(already covered)' : ''}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field id="zone-fee" label="Delivery fee (RM)" required>
                <Input id="zone-fee" type="number" min={0} step="0.01" value={feeRm} onChange={(e) => setFeeRm(e.target.value)} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field id="zone-free" label="Free delivery over (RM)" hint="Optional">
                <Input id="zone-free" type="number" min={0} step="0.01" value={freeThresholdRm} onChange={(e) => setFreeThresholdRm(e.target.value)} />
              </Field>
              <Field id="zone-eta-min" label="ETA min (hours)" required>
                <Input id="zone-eta-min" type="number" min={0} value={etaMin} onChange={(e) => setEtaMin(e.target.value)} />
              </Field>
              <Field id="zone-eta-max" label="ETA max (hours)" required>
                <Input id="zone-eta-max" type="number" min={0} value={etaMax} onChange={(e) => setEtaMax(e.target.value)} />
              </Field>
            </div>
            <div className="flex gap-2">
              <Button onClick={addZone} loading={saving}>
                Save zone
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {zones.length === 0 ? (
        <EmptyState title="No delivery zones yet" description="Add districts you deliver to, along with fees and delivery windows." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">District</th>
                <th className="px-4 py-3 font-medium">Fee</th>
                <th className="px-4 py-3 font-medium">Free over</th>
                <th className="px-4 py-3 font-medium">ETA</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {zones.map((z) => (
                <tr key={z.id}>
                  <td className="px-4 py-3 font-medium text-ink">{z.district}</td>
                  <td className="px-4 py-3 text-ink-soft">{z.deliveryFeeSen === 0 ? 'Free' : formatMoney(z.deliveryFeeSen)}</td>
                  <td className="px-4 py-3 text-ink-soft">{z.freeDeliveryThresholdSen ? formatMoney(z.freeDeliveryThresholdSen) : '—'}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {z.etaHoursMin}–{z.etaHoursMax}h
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => removeZone(z.id)} loading={removingId === z.id} aria-label="Remove zone">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
