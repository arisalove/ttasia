'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

export function ProductActiveToggle({ productId, isActive }: { productId: string; isActive: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [active, setActive] = useState(isActive);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    setSaving(true);
    const next = !active;
    try {
      const res = await fetch(`/api/supplier/products/${productId}/active`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: next }),
      });
      if (!res.ok) {
        toast('Could not update product visibility.', 'error');
        return;
      }
      setActive(next);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <button type="button" onClick={toggle} disabled={saving} className="disabled:opacity-50">
      <Badge variant={active ? 'success' : 'secondary'}>{active ? 'Active' : 'Hidden'}</Badge>
    </button>
  );
}
