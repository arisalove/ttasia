import { NextResponse } from 'next/server';
import { requireApiSession, handleApiError, ApiError } from '@/lib/auth/api-guard';
import { getQuotationById, acceptQuotation } from '@/lib/data/quotations';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApiSession('buyer');
    if (!session.buyerProfileId) throw new ApiError('Buyer profile not found.', 400);
    const { id } = await params;
    const quotation = await getQuotationById(id);
    if (!quotation || quotation.buyerId !== session.buyerProfileId) throw new ApiError('Quotation not found.', 404);

    const body = await request.json().catch(() => null);
    const fulfilmentMethod = body?.fulfilmentMethod === 'pickup' ? 'pickup' : 'delivery';
    const paymentMethod = ['bank_transfer', 'cod', 'cop'].includes(body?.paymentMethod) ? body.paymentMethod : 'bank_transfer';

    const result = await acceptQuotation(id, {
      fulfilmentMethod,
      district: body?.district,
      deliveryAddress: body?.deliveryAddress,
      paymentMethod,
    });

    if (!result.ok) return NextResponse.json({ ok: false, errors: result.errors }, { status: 422 });
    return NextResponse.json({ ok: true, orders: result.orders, skippedItems: result.skippedItems });
  } catch (err) {
    return handleApiError(err);
  }
}
