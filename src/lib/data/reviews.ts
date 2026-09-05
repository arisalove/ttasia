import 'server-only';
import { isDemoMode } from '../supabase/env';
import { getState, nextId, nowIso } from './demo-store';
import { canRate } from '../domain/orders';
import type { Review } from '../domain/types';

export async function getReviewsForSupplier(supplierId: string): Promise<Review[]> {
  if (isDemoMode()) {
    return getState().reviews.filter((r) => r.supplierId === supplierId);
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('reviews').select('*').eq('supplier_id', supplierId).order('created_at', { ascending: false });
  return (data ?? []).map((r) => ({
    id: r.id,
    orderId: r.order_id,
    buyerId: r.buyer_id,
    supplierId: r.supplier_id,
    rating: r.rating,
    comment: r.comment ?? undefined,
    createdAt: r.created_at,
  }));
}

export async function submitReview(input: { orderId: string; buyerId: string; supplierId: string; rating: 1 | 2 | 3 | 4 | 5; comment?: string }): Promise<Review> {
  if (isDemoMode()) {
    const state = getState();
    const order = state.orders.find((o) => o.id === input.orderId);
    if (!order || !canRate(order.status)) throw new Error('Only completed orders can be rated.');
    if (state.reviews.some((r) => r.orderId === input.orderId)) throw new Error('This order has already been rated.');

    const review: Review = { id: nextId('rev'), ...input, createdAt: nowIso() };
    state.reviews.push(review);

    const supplier = state.supplierProfiles.find((s) => s.id === input.supplierId);
    if (supplier) {
      const newCount = supplier.ratingCount + 1;
      supplier.rating = Number(((supplier.rating * supplier.ratingCount + input.rating) / newCount).toFixed(1));
      supplier.ratingCount = newCount;
    }
    return review;
  }

  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase
    .from('reviews')
    .insert({ order_id: input.orderId, buyer_id: input.buyerId, supplier_id: input.supplierId, rating: input.rating, comment: input.comment })
    .select('*')
    .single();
  return {
    id: data.id,
    orderId: data.order_id,
    buyerId: data.buyer_id,
    supplierId: data.supplier_id,
    rating: data.rating,
    comment: data.comment ?? undefined,
    createdAt: data.created_at,
  };
}
