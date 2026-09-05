import { NextResponse } from 'next/server';
import { requireApiSession, handleApiError, ApiError } from '@/lib/auth/api-guard';
import { checkoutSchema } from '@/lib/domain/validation';
import { checkoutCart } from '@/lib/data/orders';

export async function POST(request: Request) {
  try {
    const session = await requireApiSession('buyer');
    if (!session.buyerProfileId) throw new ApiError('Buyer profile not found.', 400);
    const body = await request.json().catch(() => null);
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? 'Invalid input.');

    if (parsed.data.fulfilmentMethod === 'delivery' && !parsed.data.district) {
      throw new ApiError('Select a delivery district.');
    }

    const result = await checkoutCart({
      buyerId: session.buyerProfileId,
      fulfilmentMethod: parsed.data.fulfilmentMethod,
      district: parsed.data.district as never,
      deliveryAddress: parsed.data.deliveryAddress,
      paymentMethod: parsed.data.paymentMethod,
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, errors: result.errors }, { status: 422 });
    }
    return NextResponse.json({ ok: true, orders: result.orders });
  } catch (err) {
    return handleApiError(err);
  }
}
