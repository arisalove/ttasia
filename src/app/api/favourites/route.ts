import { NextResponse } from 'next/server';
import { requireApiSession, handleApiError, ApiError } from '@/lib/auth/api-guard';
import { toggleFavouriteProduct, toggleFavouriteSupplier } from '@/lib/data/favourites';

export async function POST(request: Request) {
  try {
    const session = await requireApiSession('buyer');
    if (!session.buyerProfileId) throw new ApiError('Buyer profile not found.', 400);
    const body = await request.json().catch(() => null);

    if (typeof body?.productId === 'string') {
      const active = await toggleFavouriteProduct(session.buyerProfileId, body.productId);
      return NextResponse.json({ ok: true, active });
    }
    if (typeof body?.supplierId === 'string') {
      const active = await toggleFavouriteSupplier(session.buyerProfileId, body.supplierId);
      return NextResponse.json({ ok: true, active });
    }
    throw new ApiError('productId or supplierId is required.');
  } catch (err) {
    return handleApiError(err);
  }
}
