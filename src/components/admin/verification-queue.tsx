'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import type { SupplierProfile, SupplierVerificationDocument } from '@/lib/domain/types';

export function VerificationQueue({
  suppliers,
  documentsBySupplier,
}: {
  suppliers: SupplierProfile[];
  documentsBySupplier: Record<string, SupplierVerificationDocument[]>;
}) {
  if (suppliers.length === 0) {
    return <EmptyState title="Nothing to review" description="New supplier signups awaiting verification will appear here." />;
  }

  return (
    <div className="flex flex-col gap-4">
      {suppliers.map((s) => (
        <SupplierRow key={s.id} supplier={s} documents={documentsBySupplier[s.id] ?? []} />
      ))}
    </div>
  );
}

function SupplierRow({ supplier, documents }: { supplier: SupplierProfile; documents: SupplierVerificationDocument[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState<'verified' | 'rejected' | null>(null);

  async function decide(status: 'verified' | 'rejected') {
    setLoading(status);
    try {
      const res = await fetch(`/api/admin/verification/${supplier.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note: note || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? 'Could not update verification status.', 'error');
        return;
      }
      toast(status === 'verified' ? `${supplier.storeName} is now verified.` : `${supplier.storeName} was rejected.`, status === 'verified' ? 'success' : 'info');
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-semibold text-ink">{supplier.storeName}</p>
            <p className="text-sm text-muted-foreground capitalize">{supplier.supplierType}</p>
          </div>
          <Badge variant="warning" className="capitalize">
            {supplier.verificationStatus}
          </Badge>
        </div>

        <div className="mt-3 flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Documents submitted</p>
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents submitted yet.</p>
          ) : (
            documents.map((d) => (
              <p key={d.id} className="text-sm text-ink-soft">
                <span className="capitalize">{d.docType.replace(/_/g, ' ')}</span> — submitted{' '}
                {new Date(d.uploadedAt).toLocaleDateString('en-MY', { dateStyle: 'medium' })}
              </p>
            ))
          )}
        </div>

        <Textarea
          className="mt-3"
          rows={2}
          placeholder="Optional note to the supplier…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="mt-3 flex gap-2">
          <Button onClick={() => decide('verified')} loading={loading === 'verified'}>
            <Check className="h-4 w-4" /> Approve
          </Button>
          <Button variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => decide('rejected')} loading={loading === 'rejected'}>
            <X className="h-4 w-4" /> Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
