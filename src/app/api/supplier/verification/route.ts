import { NextResponse } from 'next/server';
import { requireApiSession, handleApiError, ApiError } from '@/lib/auth/api-guard';
import { submitVerificationDocument } from '@/lib/data/suppliers';

const DOC_TYPES = ['ssm_registration', 'halal_cert', 'business_license', 'other'] as const;

export async function POST(request: Request) {
  try {
    const session = await requireApiSession('supplier');
    if (!session.supplierProfileId) throw new ApiError('Supplier profile not found.', 400);
    const body = await request.json().catch(() => ({}));
    const docType = DOC_TYPES.includes(body?.docType) ? body.docType : 'ssm_registration';
    const fileName = typeof body?.fileName === 'string' ? body.fileName : 'document.pdf';

    await submitVerificationDocument(session.supplierProfileId, docType, `/demo/documents/${fileName}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
