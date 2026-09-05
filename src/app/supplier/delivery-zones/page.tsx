import { DeliveryZoneManager } from '@/components/supplier/delivery-zone-manager';
import { getSession } from '@/lib/auth/session';
import { getDeliveryZones } from '@/lib/data/suppliers';

export default async function SupplierDeliveryZonesPage() {
  const session = await getSession();
  const zones = await getDeliveryZones(session!.supplierProfileId!);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Delivery zones</h1>
        <p className="text-sm text-muted-foreground">Set which Sabah districts you deliver to, your fees, and estimated delivery times.</p>
      </div>
      <DeliveryZoneManager zones={zones} />
    </div>
  );
}
