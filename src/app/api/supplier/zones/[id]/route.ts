import { NextResponse } from 'next/server';
import { requireApiSession, handleApiError, ApiError } from '@/lib/auth/api-guard';
import { getDeliveryZones, removeDeliveryZone } from '@/lib/data/suppliers';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApiSession('supplier');
    if (!session.supplierProfileId) throw new ApiError('Supplier profile not found.', 400);
    const { id } = await params;
    const zones = await getDeliveryZones(session.supplierProfileId);
    if (!zones.some((z) => z.id === id)) throw new ApiError('Delivery zone not found.', 404);

    await removeDeliveryZone(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
