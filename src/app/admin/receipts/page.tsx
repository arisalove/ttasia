import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { getPendingReceipts } from '@/lib/data/admin';
import { isDemoMode } from '@/lib/supabase/env';

export default async function AdminReceiptsPage() {
  const receipts = await getPendingReceipts();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Receipt review</h1>

      {isDemoMode() && (
        <div className="rounded-xl border border-primary/30 bg-primary-50 px-4 py-3 text-sm text-ink">
          In demo mode, bank-transfer receipts are simulated as instantly &quot;submitted&quot; (see a buyer&apos;s order
          detail page) and move the order straight to <Badge variant="default">payment submitted</Badge> for the
          supplier to confirm. A real deployment would queue the uploaded file here for admin review before
          releasing funds — wire up the <code className="rounded bg-white px-1 py-0.5">payment-receipts</code>{' '}
          Supabase Storage bucket and this queue to enable that.
        </div>
      )}

      {receipts.length === 0 ? (
        <EmptyState title="No receipts awaiting review" description="Buyer-uploaded bank transfer receipts pending approval will appear here." />
      ) : (
        <div className="flex flex-col gap-3">
          {receipts.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-white p-4 text-sm">
              Order {r.orderId} — submitted {new Date(r.uploadedAt).toLocaleString('en-MY')}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
