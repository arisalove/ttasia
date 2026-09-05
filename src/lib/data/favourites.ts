import 'server-only';
import { isDemoMode } from '../supabase/env';
import { getState, nextId, nowIso } from './demo-store';
import type { Favourite } from '../domain/types';

export async function getFavourites(buyerId: string): Promise<Favourite[]> {
  if (isDemoMode()) {
    return getState().favourites.filter((f) => f.buyerId === buyerId);
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('favourites').select('*').eq('buyer_id', buyerId);
  return (data ?? []).map((f) => ({
    id: f.id,
    buyerId: f.buyer_id,
    productId: f.product_id ?? undefined,
    supplierId: f.supplier_id ?? undefined,
    createdAt: f.created_at,
  }));
}

export async function toggleFavouriteProduct(buyerId: string, productId: string): Promise<boolean> {
  if (isDemoMode()) {
    const state = getState();
    const existing = state.favourites.find((f) => f.buyerId === buyerId && f.productId === productId);
    if (existing) {
      state.favourites = state.favourites.filter((f) => f.id !== existing.id);
      return false;
    }
    state.favourites.push({ id: nextId('fav'), buyerId, productId, createdAt: nowIso() });
    return true;
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data: existing } = await supabase.from('favourites').select('id').eq('buyer_id', buyerId).eq('product_id', productId).maybeSingle();
  if (existing) {
    await supabase.from('favourites').delete().eq('id', existing.id);
    return false;
  }
  await supabase.from('favourites').insert({ buyer_id: buyerId, product_id: productId });
  return true;
}

export async function toggleFavouriteSupplier(buyerId: string, supplierId: string): Promise<boolean> {
  if (isDemoMode()) {
    const state = getState();
    const existing = state.favourites.find((f) => f.buyerId === buyerId && f.supplierId === supplierId);
    if (existing) {
      state.favourites = state.favourites.filter((f) => f.id !== existing.id);
      return false;
    }
    state.favourites.push({ id: nextId('fav'), buyerId, supplierId, createdAt: nowIso() });
    return true;
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data: existing } = await supabase.from('favourites').select('id').eq('buyer_id', buyerId).eq('supplier_id', supplierId).maybeSingle();
  if (existing) {
    await supabase.from('favourites').delete().eq('id', existing.id);
    return false;
  }
  await supabase.from('favourites').insert({ buyer_id: buyerId, supplier_id: supplierId });
  return true;
}
