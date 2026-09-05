import { NextResponse } from 'next/server';
import { requireApiSession, handleApiError, ApiError } from '@/lib/auth/api-guard';
import { reviewSchema } from '@/lib/domain/validation';
import { getOrderById } from '@/lib/data/orders';
import { submitReview } from '@/lib/data/reviews';

export async function POST(request: Request) {
  try {
    const session = await requireApiSession('buyer');
    if (!session.buyerProfileId) throw new ApiError('Buyer profile not found.', 400);
    const body = await request.json().catch(() => null);
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? 'Invalid input.');

    const order = await getOrderById(parsed.data.orderId);
    if (!order || order.buyerId !== session.buyerProfileId) throw new ApiError('Order not found.', 404);

    const review = await submitReview({
      orderId: order.id,
      buyerId: order.buyerId,
      supplierId: order.supplierId,
      rating: parsed.data.rating as 1 | 2 | 3 | 4 | 5,
      comment: parsed.data.comment,
    });
    return NextResponse.json({ ok: true, review });
  } catch (err) {
    return handleApiError(err);
  }
}
