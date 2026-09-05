import { NextResponse } from 'next/server';
import { requireApiSession, handleApiError, ApiError } from '@/lib/auth/api-guard';
import { getOrderById } from '@/lib/data/orders';
import { addToCart } from '@/lib/data/cart';

/** Adds every line item from a past order back into the buyer's cart. */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApiSession('buyer');
    if (!session.buyerProfileId) throw new ApiError('Buyer profile not found.', 400);
    const { id } = await params;
    const order = await getOrderById(id);
    if (!order || order.buyerId !== session.buyerProfileId) throw new ApiError('Order not found.', 404);

    for (const item of order.items) {
      await addToCart(session.buyerProfileId, item.productId, item.qty);
    }

    return NextResponse.json({ ok: true, addedItems: order.items.length });
  } catch (err) {
    return handleApiError(err);
  }
}
