import { NextResponse } from 'next/server';
import { requireApiSession, handleApiError, ApiError } from '@/lib/auth/api-guard';
import { getProductsForSupplier, setProductActive, updateStock } from '@/lib/data/suppliers';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApiSession('supplier');
    if (!session.supplierProfileId) throw new ApiError('Supplier profile not found.', 400);
    const { id } = await params;

    const products = await getProductsForSupplier(session.supplierProfileId);
    if (!products.some((p) => p.id === id)) throw new ApiError('Product not found.', 404);

    const body = await request.json().catch(() => null);
    if (typeof body?.isActive === 'boolean') {
      await setProductActive(id, body.isActive);
    }
    if (typeof body?.stockQty === 'number') {
      await updateStock(id, body.stockQty);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
