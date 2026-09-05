'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field } from '@/components/ui/field';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { formatMoney } from '@/lib/utils/money';
import type { Quotation, QuotationStatus } from '@/lib/domain/types';

const STATUS_VARIANT: Record<QuotationStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  requested: 'warning',
  quoted: 'default',
  accepted: 'success',
  declined: 'destructive',
  expired: 'secondary',
  converted: 'success',
};

export function QuotationResponder({ quotations, buyerNames }: { quotations: Quotation[]; buyerNames: Record<string, string> }) {
  if (quotations.length === 0) {
    return <EmptyState title="No quotation requests" description="When buyers request bulk pricing from you, they'll appear here." />;
  }

  return (
    <div className="flex flex-col gap-4">
      {quotations.map((q) => (
        <QuotationRow key={q.id} quotation={q} buyerName={buyerNames[q.buyerId] ?? 'Buyer'} />
      ))}
    </div>
  );
}

function QuotationRow({ quotation, buyerName }: { quotation: Quotation; buyerName: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [prices, setPrices] = useState<Record<string, string>>(
    Object.fromEntries(quotation.items.map((i) => [i.id, i.proposedPriceSen ? (i.proposedPriceSen / 100).toFixed(2) : ''])),
  );
  const [response, setResponse] = useState(quotation.supplierResponse ?? '');
  const [submitting, setSubmitting] = useState<'quoted' | 'declined' | null>(null);

  async function submit(status: 'quoted' | 'declined') {
    if (!response.trim()) {
      toast('Add a short response message.', 'error');
      return;
    }
    setSubmitting(status);
    try {
      const itemPricesSen =
        status === 'quoted'
          ? Object.fromEntries(Object.entries(prices).map(([id, rm]) => [id, Math.round(parseFloat(rm || '0') * 100)]))
          : undefined;
      const res = await fetch(`/api/rfq/${quotation.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, supplierResponse: response, itemPricesSen }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? 'Could not respond to this request.', 'error');
        return;
      }
      toast(status === 'quoted' ? 'Quote sent to buyer.' : 'Request declined.', 'success');
      router.refresh();
    } finally {
      setSubmitting(null);
    }
  }

  const isPending = quotation.status === 'requested';

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-semibold text-ink">{quotation.quotationNumber}</p>
            <p className="text-sm text-muted-foreground">From {buyerName}</p>
          </div>
          <Badge variant={STATUS_VARIANT[quotation.status]} className="capitalize">
            {quotation.status}
          </Badge>
        </div>

        <ul className="mt-3 space-y-2 text-sm text-ink-soft">
          {quotation.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3">
              <span>
                {item.qty} {item.unit} — {item.description}
              </span>
              {isPending && (
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="RM / unit"
                  className="h-9 w-28"
                  value={prices[item.id]}
                  onChange={(e) => setPrices((prev) => ({ ...prev, [item.id]: e.target.value }))}
                />
              )}
              {!isPending && item.proposedPriceSen != null && (
                <span className="font-medium text-ink">{formatMoney(item.proposedPriceSen)}/{item.unit}</span>
              )}
            </li>
          ))}
        </ul>

        {quotation.message && <p className="mt-2 text-sm italic text-muted-foreground">&ldquo;{quotation.message}&rdquo;</p>}

        {isPending ? (
          <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
            <Field id={`response-${quotation.id}`} label="Your response">
              <Textarea
                id={`response-${quotation.id}`}
                rows={2}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="e.g. Happy to offer this pricing for weekly orders of 50kg+."
              />
            </Field>
            <div className="flex gap-2">
              <Button onClick={() => submit('quoted')} loading={submitting === 'quoted'}>
                Send quote
              </Button>
              <Button variant="outline" onClick={() => submit('declined')} loading={submitting === 'declined'}>
                Decline
              </Button>
            </div>
          </div>
        ) : (
          quotation.supplierResponse && (
            <div className="mt-3 rounded-lg bg-surface-muted p-3 text-sm">
              <p className="font-medium text-ink">Your response</p>
              <p className="text-ink-soft">{quotation.supplierResponse}</p>
              {quotation.totalSen != null && <p className="mt-1 font-bold text-ink">Total quoted: {formatMoney(quotation.totalSen)}</p>}
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
