import { RfqManager } from '@/components/rfq/rfq-manager';
import { getSession } from '@/lib/auth/session';
import { getQuotationsForBuyer } from '@/lib/data/quotations';
import { getProducts, getSuppliers } from '@/lib/data/catalogue';

export default async function BuyerRfqPage() {
  const session = await getSession();
  const buyerId = session!.buyerProfileId!;
  const [quotations, suppliers] = await Promise.all([getQuotationsForBuyer(buyerId), getSuppliers()]);

  // Each supplier's product list, so a buyer can (optionally) tie an RFQ line
  // to a real catalogue product — see RfqManager for why this matters: only
  // catalogue-linked items can automatically become an order once quoted.
  const productsBySupplier = Object.fromEntries(
    await Promise.all(
      suppliers.map(async (s) => {
        const { items } = await getProducts({ supplierId: s.id, pageSize: 200 });
        return [s.id, items.map((p) => ({ id: p.id, name: p.name, unit: p.unit }))] as const;
      }),
    ),
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Request for quotation</h1>
      <RfqManager quotations={quotations} suppliers={suppliers} productsBySupplier={productsBySupplier} />
    </div>
  );
}
