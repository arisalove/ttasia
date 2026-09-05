'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export function CommissionForm({ currentPercent }: { currentPercent: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const [percent, setPercent] = useState(String(currentPercent));
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/commission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commissionPercent: Number(percent) }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? 'Could not update commission rate.', 'error');
        return;
      }
      toast('Commission rate updated.', 'success');
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <Field id="commission" label="Platform commission (%)" className="max-w-xs" hint="Applied to each completed order's subtotal">
        <Input id="commission" type="number" min={0} max={100} step="0.5" value={percent} onChange={(e) => setPercent(e.target.value)} />
      </Field>
      <Button onClick={save} loading={saving}>
        Save
      </Button>
    </div>
  );
}
