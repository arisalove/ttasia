import { NextResponse } from 'next/server';
import { requireApiSession, handleApiError, ApiError } from '@/lib/auth/api-guard';
import { updateSupplierProfile } from '@/lib/data/suppliers';

export async function POST(request: Request) {
  try {
    const session = await requireApiSession('supplier');
    if (!session.supplierProfileId) throw new ApiError('Supplier profile not found.', 400);
    const body = await request.json().catch(() => null);

    await updateSupplierProfile(session.supplierProfileId, {
      storeName: typeof body?.storeName === 'string' ? body.storeName : undefined,
      storeDescription: typeof body?.storeDescription === 'string' ? body.storeDescription : undefined,
      minimumOrderSen: typeof body?.minimumOrderSen === 'number' ? body.minimumOrderSen : undefined,
      logoUrl: typeof body?.logoUrl === 'string' ? body.logoUrl : undefined,
      bannerUrl: typeof body?.bannerUrl === 'string' ? body.bannerUrl : undefined,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
