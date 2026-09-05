import { NextResponse } from 'next/server';
import { requireApiSession, handleApiError, ApiError } from '@/lib/auth/api-guard';
import { removeCartItem, updateCartItemQty } from '@/lib/data/cart';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApiSession('buyer');
    if (!session.buyerProfileId) throw new ApiError('Buyer profile not found.', 400);
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const qty = Number(body?.qty);
    if (!Number.isFinite(qty) || qty <= 0) throw new ApiError('Quantity must be greater than zero.');

    const items = await updateCartItemQty(session.buyerProfileId, id, qty);
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApiSession('buyer');
    if (!session.buyerProfileId) throw new ApiError('Buyer profile not found.', 400);
    const { id } = await params;
    const items = await removeCartItem(session.buyerProfileId, id);
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    return handleApiError(err);
  }
}
