import 'server-only';
import { isDemoMode } from '../supabase/env';
import { getState, nextId, nowIso } from './demo-store';
import type { Quotation, QuotationItem, QuotationStatus } from '../domain/types';
import { checkoutCart } from './orders';
import { addToCart, clearCart } from './cart';

export async function getQuotationsForBuyer(buyerId: string): Promise<Quotation[]> {
  if (isDemoMode()) {
    return getState()
      .quotations.filter((q) => q.buyerId === buyerId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase
    .from('quotation_requests')
    .select('*, quotation_items(*)')
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false });
  return (data ?? []).map(mapDbQuotation);
}

export async function getQuotationsForSupplier(supplierId: string): Promise<Quotation[]> {
  if (isDemoMode()) {
    return getState()
      .quotations.filter((q) => q.supplierId === supplierId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase
    .from('quotation_requests')
    .select('*, quotation_items(*)')
    .eq('supplier_id', supplierId)
    .order('created_at', { ascending: false });
  return (data ?? []).map(mapDbQuotation);
}

export async function getQuotationById(id: string): Promise<Quotation | null> {
  if (isDemoMode()) return getState().quotations.find((q) => q.id === id) ?? null;
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('quotation_requests').select('*, quotation_items(*)').eq('id', id).single();
  return data ? mapDbQuotation(data) : null;
}

export interface CreateQuotationInput {
  buyerId: string;
  supplierId: string;
  message?: string;
  items: { productId?: string; description: string; qty: number; unit: QuotationItem['unit'] }[];
}

export async function createQuotationRequest(input: CreateQuotationInput): Promise<Quotation> {
  if (isDemoMode()) {
    const state = getState();
    const id = nextId('quote');
    const quotation: Quotation = {
      id,
      quotationNumber: `RFQ-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(state.seq).padStart(5, '0')}`,
      buyerId: input.buyerId,
      supplierId: input.supplierId,
      status: 'requested',
      message: input.message,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      items: input.items.map((i) => ({
        id: nextId('qi'),
        quotationId: id,
        productId: i.productId,
        description: i.description,
        qty: i.qty,
        unit: i.unit,
      })),
    };
    state.quotations.unshift(quotation);

    const supplier = state.supplierProfiles.find((s) => s.id === input.supplierId);
    if (supplier) {
      state.notifications.unshift({
        id: nextId('notif'),
        userId: supplier.userId,
        type: 'quotation',
        title: 'New quotation request',
        body: `A buyer requested a quote (${quotation.quotationNumber}).`,
        href: `/supplier/quotations`,
        createdAt: nowIso(),
      });
    }
    return quotation;
  }

  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data: qr } = await supabase
    .from('quotation_requests')
    .insert({ buyer_id: input.buyerId, supplier_id: input.supplierId, message: input.message })
    .select('*')
    .single();
  await supabase.from('quotation_items').insert(
    input.items.map((i) => ({
      quotation_id: qr.id,
      product_id: i.productId,
      description: i.description,
      qty: i.qty,
      unit: i.unit,
    })),
  );
  return (await getQuotationById(qr.id))!;
}

export interface RespondToQuotationInput {
  quotationId: string;
  status: Extract<QuotationStatus, 'quoted' | 'declined'>;
  supplierResponse: string;
  itemPricesSen?: Record<string, number>; // quotationItemId -> proposedPriceSen
  validUntil?: string;
}

export async function respondToQuotation(input: RespondToQuotationInput): Promise<Quotation> {
  if (isDemoMode()) {
    const state = getState();
    const quotation = state.quotations.find((q) => q.id === input.quotationId);
    if (!quotation) throw new Error('Quotation not found');
    quotation.status = input.status;
    quotation.supplierResponse = input.supplierResponse;
    quotation.validUntil = input.validUntil;
    quotation.updatedAt = nowIso();

    if (input.itemPricesSen) {
      for (const item of quotation.items) {
        const price = input.itemPricesSen[item.id];
        if (price != null) item.proposedPriceSen = price;
      }
    }
    if (input.status === 'quoted') {
      quotation.totalSen = quotation.items.reduce((sum, i) => sum + (i.proposedPriceSen ?? 0) * i.qty, 0);
    }

    const buyer = state.buyerProfiles.find((b) => b.id === quotation.buyerId);
    if (buyer) {
      state.notifications.unshift({
        id: nextId('notif'),
        userId: buyer.userId,
        type: 'quotation',
        title: input.status === 'quoted' ? 'Quotation received' : 'Quotation declined',
        body: `Your request ${quotation.quotationNumber} was ${input.status}.`,
        href: '/buyer/rfq',
        createdAt: nowIso(),
      });
    }
    return quotation;
  }

  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  await supabase
    .from('quotation_requests')
    .update({ status: input.status, supplier_response: input.supplierResponse, valid_until: input.validUntil })
    .eq('id', input.quotationId);
  if (input.itemPricesSen) {
    for (const [itemId, price] of Object.entries(input.itemPricesSen)) {
      await supabase.from('quotation_items').update({ proposed_price_sen: price }).eq('id', itemId);
    }
  }
  return (await getQuotationById(input.quotationId))!;
}

/**
 * Buyer accepts a quoted RFQ: converts it into a real order via the normal
 * checkout path, billing the supplier's quoted per-item price (not the
 * standard catalogue price). Only items that reference a real catalogue
 * product can become an order line — the `order_items` table requires a
 * product reference — so any free-text/custom item (no `productId`) is
 * reported back as `skippedItems` rather than silently dropped, and the
 * caller is expected to surface that to the buyer (see
 * src/components/rfq/rfq-manager.tsx).
 */
export async function acceptQuotation(
  quotationId: string,
  checkoutMeta: { fulfilmentMethod: 'delivery' | 'pickup'; district?: string; deliveryAddress?: string; paymentMethod: 'bank_transfer' | 'cod' | 'cop' },
) {
  const quotation = await getQuotationById(quotationId);
  if (!quotation || quotation.status !== 'quoted') throw new Error('Quotation is not ready to accept');

  const skippedItems = quotation.items.filter((item) => !item.productId).map((item) => item.description);

  await clearCart(quotation.buyerId);
  for (const item of quotation.items) {
    if (item.productId) {
      // Bill the supplier's quoted price when one was given; fall back to
      // catalogue/tiered pricing only if the supplier didn't price this line.
      await addToCart(quotation.buyerId, item.productId, item.qty, item.proposedPriceSen);
    }
  }

  const result = await checkoutCart({
    buyerId: quotation.buyerId,
    fulfilmentMethod: checkoutMeta.fulfilmentMethod,
    district: checkoutMeta.district as never,
    deliveryAddress: checkoutMeta.deliveryAddress,
    paymentMethod: checkoutMeta.paymentMethod,
  });

  if (result.ok && isDemoMode()) {
    const state = getState();
    const q = state.quotations.find((x) => x.id === quotationId);
    if (q) {
      q.status = 'converted';
      q.convertedOrderId = result.orders?.[0]?.id;
      q.updatedAt = nowIso();
    }
  } else if (result.ok) {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();
    await supabase
      .from('quotation_requests')
      .update({ status: 'converted', converted_order_id: result.orders?.[0]?.id })
      .eq('id', quotationId);
  }

  return { ...result, skippedItems };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbQuotation(row: any): Quotation {
  return {
    id: row.id,
    quotationNumber: row.quotation_number,
    buyerId: row.buyer_id,
    supplierId: row.supplier_id,
    status: row.status,
    message: row.message ?? undefined,
    supplierResponse: row.supplier_response ?? undefined,
    validUntil: row.valid_until ?? undefined,
    totalSen: row.total_sen ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    convertedOrderId: row.converted_order_id ?? undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: (row.quotation_items ?? []).map((i: any) => ({
      id: i.id,
      quotationId: i.quotation_id,
      productId: i.product_id ?? undefined,
      description: i.description,
      qty: Number(i.qty),
      unit: i.unit,
      proposedPriceSen: i.proposed_price_sen ?? undefined,
    })),
  };
}
