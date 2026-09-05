import { redirect } from 'next/navigation';
import { CheckoutForm } from '@/components/cart/checkout-form';
import { getSession } from '@/lib/auth/session';
import { getCartItems } from '@/lib/data/cart';
import { getDeliveryZonesForSupplier, getSuppliers } from '@/lib/data/catalogue';
import { getBusinessProfileForUser } from '@/lib/data/profile';
import type { DeliveryZone, SupplierProfile } from '@/lib/domain/types';

export default async function CheckoutPage() {
  const session = await getSession();
  const buyerId = session!.buyerProfileId!;
  const items = await getCartItems(buyerId);
  if (items.length === 0) redirect('/buyer/cart');

  const supplierIds = Array.from(new Set(items.map((i) => i.supplierId)));
  const allSuppliers = await getSuppliers();
  const suppliers: Record<string, SupplierProfile> = {};
  allSuppliers.forEach((s) => {
    suppliers[s.id] = s;
  });

  const zonesBySupplier: Record<string, DeliveryZone[]> = {};
  await Promise.all(
    supplierIds.map(async (id) => {
      zonesBySupplier[id] = await getDeliveryZonesForSupplier(id);
    }),
  );

  const businessProfile = await getBusinessProfileForUser(session!.user.id);
  const businessAddress = businessProfile?.address ?? '';

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Checkout</h1>
      <CheckoutForm
        items={items}
        suppliers={suppliers}
        zonesBySupplier={zonesBySupplier}
        businessAddress={businessAddress}
        defaultDistrict={businessProfile?.district}
      />
    </div>
  );
}
