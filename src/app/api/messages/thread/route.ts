import { NextResponse } from 'next/server';
import { requireApiSession, handleApiError, ApiError } from '@/lib/auth/api-guard';
import { getOrCreateThread } from '@/lib/data/messages';

/**
 * Starts (or resumes) a conversation. A buyer passes `supplierId` (e.g. from a
 * product/storefront page); a supplier passes `buyerId` (e.g. from an order
 * detail page) to reach a buyer they've already received an order from.
 */
export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    const body = await request.json().catch(() => null);

    if (session.user.role === 'buyer') {
      if (!session.buyerProfileId) throw new ApiError('Buyer profile not found.', 400);
      const supplierId = body?.supplierId;
      if (typeof supplierId !== 'string' || !supplierId) throw new ApiError('supplierId is required.');
      const thread = await getOrCreateThread(session.buyerProfileId, supplierId);
      return NextResponse.json({ ok: true, thread });
    }

    if (session.user.role === 'supplier') {
      if (!session.supplierProfileId) throw new ApiError('Supplier profile not found.', 400);
      const buyerId = body?.buyerId;
      if (typeof buyerId !== 'string' || !buyerId) throw new ApiError('buyerId is required.');
      const thread = await getOrCreateThread(buyerId, session.supplierProfileId);
      return NextResponse.json({ ok: true, thread });
    }

    throw new ApiError('You do not have access to this action.', 403);
  } catch (err) {
    return handleApiError(err);
  }
}
