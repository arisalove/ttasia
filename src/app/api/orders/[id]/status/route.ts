import { NextResponse } from 'next/server';
import { requireApiSession, handleApiError, ApiError } from '@/lib/auth/api-guard';
import { getOrderById, updateOrderStatus } from '@/lib/data/orders';
import { actorForTransition } from '@/lib/domain/orders';
import { ORDER_STATUSES } from '@/lib/domain/types';
import type { OrderStatus } from '@/lib/domain/types';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApiSession();
    const { id } = await params;
    const order = await getOrderById(id);
    if (!order) throw new ApiError('Order not found.', 404);

    const isParticipant =
      (session.user.role === 'buyer' && session.buyerProfileId === order.buyerId) ||
      (session.user.role === 'supplier' && session.supplierProfileId === order.supplierId) ||
      session.user.role === 'admin';
    if (!isParticipant) throw new ApiError('You do not have access to this order.', 403);

    const body = await request.json().catch(() => null);
    const toStatus = body?.status;
    if (typeof toStatus !== 'string' || !ORDER_STATUSES.includes(toStatus as never)) {
      throw new ApiError('Invalid status.');
    }

    // Admins may force any legal transition (see README's noted MVP scope cut);
    // buyers/suppliers may only trigger transitions that belong to their role.
    if (session.user.role !== 'admin') {
      const actor = actorForTransition(toStatus as OrderStatus);
      const allowed = actor === 'buyer_or_supplier' || actor === session.user.role;
      if (!allowed) throw new ApiError('This action can only be performed by the other party on this order.', 403);
    }

    const updated = await updateOrderStatus(id, toStatus as never, session.user.id, body?.note);
    return NextResponse.json({ ok: true, order: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
