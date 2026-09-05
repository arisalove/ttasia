import { VerificationQueue } from '@/components/admin/verification-queue';
import { getPendingSuppliers } from '@/lib/data/admin';
import { getVerificationDocuments } from '@/lib/data/suppliers';

export default async function AdminVerificationPage() {
  const suppliers = await getPendingSuppliers();
  const documentsBySupplier = Object.fromEntries(
    await Promise.all(suppliers.map(async (s) => [s.id, await getVerificationDocuments(s.id)] as const)),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Verification queue</h1>
        <p className="text-sm text-muted-foreground">Review supplier documents before their storefront goes live.</p>
      </div>
      <VerificationQueue suppliers={suppliers} documentsBySupplier={documentsBySupplier} />
    </div>
  );
}
