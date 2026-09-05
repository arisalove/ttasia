import { NextResponse } from 'next/server';
import { requireApiSession, handleApiError, ApiError } from '@/lib/auth/api-guard';
import { getOrderById, updateOrderStatus } from '@/lib/data/orders';

/**
 * Buyer "uploads" a bank-transfer receipt. In this MVP the file itself isn't
 * persisted to storage (see README — wire up Supabase Storage's
 * `payment-receipts` bucket for that in live mode); what matters for the
 * demo is the state transition and the supplier notification, which are
 * both real. We never claim a payment was actually captured.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApiSession('buyer');
    if (!session.buyerProfileId) throw new ApiError('Buyer profile not found.', 400);
    const { id } = await params;
    const order = await getOrderById(id);
    if (!order || order.buyerId !== session.buyerProfileId) throw new ApiError('Order not found.', 404);
    if (order.status !== 'pending_payment') throw new ApiError('This order is not awaiting payment.', 400);

    const body = await request.json().catch(() => ({}));
    const fileName = typeof body?.fileName === 'string' ? body.fileName : 'receipt.jpg';

    const updated = await updateOrderStatus(id, 'payment_submitted', session.user.id, `Receipt uploaded: ${fileName}`);
    return NextResponse.json({ ok: true, order: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
