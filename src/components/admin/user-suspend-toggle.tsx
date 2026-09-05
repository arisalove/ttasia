'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export function UserSuspendToggle({ userId, suspended }: { userId: string; suspended: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!suspended && !confirm('Suspend this user? They will be unable to sign in or transact.')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspended: !suspended }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? 'Could not update this user.', 'error');
        return;
      }
      toast(suspended ? 'User reinstated.' : 'User suspended.', 'success');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className={suspended ? undefined : 'text-destructive hover:bg-destructive/10'}
      onClick={toggle}
      loading={loading}
    >
      {suspended ? 'Reinstate' : 'Suspend'}
    </Button>
  );
}
