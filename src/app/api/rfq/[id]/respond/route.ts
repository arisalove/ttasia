import { NextResponse } from 'next/server';
import { requireApiSession, handleApiError, ApiError } from '@/lib/auth/api-guard';
import { getQuotationById, respondToQuotation } from '@/lib/data/quotations';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApiSession('supplier');
    if (!session.supplierProfileId) throw new ApiError('Supplier profile not found.', 400);
    const { id } = await params;
    const quotation = await getQuotationById(id);
    if (!quotation || quotation.supplierId !== session.supplierProfileId) throw new ApiError('Quotation not found.', 404);

    const body = await request.json().catch(() => null);
    const status = body?.status === 'declined' ? 'declined' : 'quoted';
    const supplierResponse = typeof body?.supplierResponse === 'string' ? body.supplierResponse : '';
    if (!supplierResponse) throw new ApiError('Add a response message.');

    const updated = await respondToQuotation({
      quotationId: id,
      status,
      supplierResponse,
      itemPricesSen: body?.itemPricesSen,
      validUntil: body?.validUntil,
    });
    return NextResponse.json({ ok: true, quotation: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
