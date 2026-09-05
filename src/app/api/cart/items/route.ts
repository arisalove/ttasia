import { NextResponse } from 'next/server';
import { requireApiSession, handleApiError, ApiError } from '@/lib/auth/api-guard';
import { addToCartSchema } from '@/lib/domain/validation';
import { addToCart } from '@/lib/data/cart';

export async function POST(request: Request) {
  try {
    const session = await requireApiSession('buyer');
    if (!session.buyerProfileId) throw new ApiError('Buyer profile not found.', 400);
    const body = await request.json().catch(() => null);
    const parsed = addToCartSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? 'Invalid input.');

    const items = await addToCart(session.buyerProfileId, parsed.data.productId, parsed.data.qty);
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    return handleApiError(err);
  }
}
