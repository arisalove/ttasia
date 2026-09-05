import { NextResponse } from 'next/server';
import { requireApiSession, handleApiError, ApiError } from '@/lib/auth/api-guard';
import { deliveryZoneSchema } from '@/lib/domain/validation';
import { upsertDeliveryZone } from '@/lib/data/suppliers';

export async function POST(request: Request) {
  try {
    const session = await requireApiSession('supplier');
    if (!session.supplierProfileId) throw new ApiError('Supplier profile not found.', 400);
    const body = await request.json().catch(() => null);
    const parsed = deliveryZoneSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? 'Invalid input.');

    const zone = await upsertDeliveryZone({ ...parsed.data, supplierId: session.supplierProfileId });
    return NextResponse.json({ ok: true, zone });
  } catch (err) {
    return handleApiError(err);
  }
}
