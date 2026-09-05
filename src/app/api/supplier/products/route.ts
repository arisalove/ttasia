import { NextResponse } from 'next/server';
import { requireApiSession, handleApiError, ApiError } from '@/lib/auth/api-guard';
import { productSchema } from '@/lib/domain/validation';
import { upsertProduct } from '@/lib/data/suppliers';

export async function POST(request: Request) {
  try {
    const session = await requireApiSession('supplier');
    if (!session.supplierProfileId) throw new ApiError('Supplier profile not found.', 400);
    const body = await request.json().catch(() => null);
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? 'Invalid input.');

    const product = await upsertProduct({ ...parsed.data, supplierId: session.supplierProfileId });
    return NextResponse.json({ ok: true, product });
  } catch (err) {
    return handleApiError(err);
  }
}
