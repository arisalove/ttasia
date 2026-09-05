import { QuotationResponder } from '@/components/rfq/quotation-responder';
import { getSession } from '@/lib/auth/session';
import { getQuotationsForSupplier } from '@/lib/data/quotations';
import { getBuyerDisplayNames } from '@/lib/data/profile';

export default async function SupplierQuotationsPage() {
  const session = await getSession();
  const [quotations, buyerNames] = await Promise.all([
    getQuotationsForSupplier(session!.supplierProfileId!),
    getBuyerDisplayNames(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Quotation requests</h1>
      <QuotationResponder quotations={quotations} buyerNames={buyerNames} />
    </div>
  );
}
