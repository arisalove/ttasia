import { NextResponse } from 'next/server';
import { requireApiSession, handleApiError, ApiError } from '@/lib/auth/api-guard';
import { rfqSchema } from '@/lib/domain/validation';
import { createQuotationRequest } from '@/lib/data/quotations';

export async function POST(request: Request) {
  try {
    const session = await requireApiSession('buyer');
    if (!session.buyerProfileId) throw new ApiError('Buyer profile not found.', 400);
    const body = await request.json().catch(() => null);
    const parsed = rfqSchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message ?? 'Invalid input.');

    const quotation = await createQuotationRequest({
      buyerId: session.buyerProfileId,
      supplierId: parsed.data.supplierId,
      message: parsed.data.message,
      items: parsed.data.items,
    });
    return NextResponse.json({ ok: true, quotation });
  } catch (err) {
    return handleApiError(err);
  }
}
