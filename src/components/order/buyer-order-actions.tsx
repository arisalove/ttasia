'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { canRate, canTransition } from '@/lib/domain/orders';
import type { Order } from '@/lib/domain/types';
import { cn } from '@/lib/utils/cn';

export function BuyerOrderActions({ order, hasReview }: { order: Order; hasReview: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  async function uploadReceipt() {
    const file = fileInputRef.current?.files?.[0];
    setUploading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file?.name }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? 'Could not upload receipt.', 'error');
        return;
      }
      toast('Receipt uploaded — the supplier has been notified to verify it.', 'success');
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  async function cancelOrder() {
    if (!confirm('Cancel this order? This cannot be undone.')) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? 'Could not cancel order.', 'error');
        return;
      }
      toast('Order cancelled.', 'info');
      router.refresh();
    } finally {
      setCancelling(false);
    }
  }

  async function reorder() {
    setReordering(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/reorder`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? 'Could not reorder.', 'error');
        return;
      }
      toast(`Added ${data.addedItems} item(s) to your cart.`, 'success');
      router.push('/buyer/cart');
    } finally {
      setReordering(false);
    }
  }

  async function submitReview() {
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? 'Could not submit review.', 'error');
        return;
      }
      toast('Thanks for your feedback!', 'success');
      setReviewOpen(false);
      router.refresh();
    } finally {
      setSubmittingReview(false);
    }
  }

  const canCancel = canTransition(order.status, 'cancelled');

  return (
    <div className="flex flex-col gap-4">
      {order.status === 'pending_payment' && order.paymentMethod === 'bank_transfer' && (
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-4">
          <p className="font-semibold text-warning">Upload your bank transfer receipt</p>
          <p className="mt-1 text-sm text-ink-soft">
            Transfer {order.totalSen ? `RM ${(order.totalSen / 100).toFixed(2)}` : 'the order total'} to the
            supplier&apos;s registered bank account (shown in their confirmation message), then upload proof here.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="text-sm" />
            <Button size="sm" onClick={uploadReceipt} loading={uploading}>
              <Upload className="h-4 w-4" /> Upload receipt
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={reorder} loading={reordering}>
          Reorder these items
        </Button>
        {canCancel && (
          <Button variant="outline" className="text-destructive hover:bg-destructive/10" onClick={cancelOrder} loading={cancelling}>
            Cancel order
          </Button>
        )}
        {canRate(order.status) && !hasReview && (
          <Button variant="outline" onClick={() => setReviewOpen((v) => !v)}>
            <Star className="h-4 w-4" /> Rate this order
          </Button>
        )}
      </div>

      {reviewOpen && (
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="mb-2 text-sm font-medium text-ink">How was your experience?</p>
          <div className="mb-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`}>
                <Star className={cn('h-7 w-7', n <= rating ? 'fill-primary-500 text-primary-500' : 'text-border')} />
              </button>
            ))}
          </div>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Optional comment for the supplier…" />
          <Button className="mt-3" size="sm" onClick={submitReview} loading={submittingReview}>
            Submit review
          </Button>
        </div>
      )}
    </div>
  );
}
