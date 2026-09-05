import 'server-only';
import { isDemoMode } from '../supabase/env';
import { getState, nextId } from './demo-store';
import { resolveUnitPriceSen } from '../domain/pricing';
import type { CartItem } from '../domain/types';

export async function getCartItems(buyerId: string): Promise<CartItem[]> {
  if (isDemoMode()) {
    const state = getState();
    const ids = state.cartsByBuyer[buyerId] ?? [];
    return state.cartItems.filter((i) => ids.includes(i.id));
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data: cart } = await supabase.from('carts').select('id').eq('buyer_id', buyerId).maybeSingle();
  if (!cart) return [];
  const { data } = await supabase.from('cart_items').select('*').eq('cart_id', cart.id);
  return (data ?? []).map((i) => ({
    id: i.id,
    productId: i.product_id,
    supplierId: i.supplier_id,
    qty: Number(i.qty),
    unitPriceSen: i.unit_price_sen,
    notes: i.notes ?? undefined,
  }));
}

/**
 * `overrideUnitPriceSen`, when given, skips the normal tiered-pricing lookup
 * and bills exactly that price instead — used when converting an accepted,
 * supplier-quoted RFQ into an order, so the buyer pays the negotiated price
 * rather than the standard catalogue price.
 */
export async function addToCart(buyerId: string, productId: string, qty: number, overrideUnitPriceSen?: number): Promise<CartItem[]> {
  if (isDemoMode()) {
    const state = getState();
    const product = state.products.find((p) => p.id === productId);
    if (!product) throw new Error('Product not found');

    const existingIds = state.cartsByBuyer[buyerId] ?? [];
    const existing = state.cartItems.find((i) => existingIds.includes(i.id) && i.productId === productId);

    if (existing) {
      existing.qty += qty;
      existing.unitPriceSen = overrideUnitPriceSen ?? resolveUnitPriceSen(product, existing.qty);
    } else {
      const item: CartItem = {
        id: nextId('cart-item'),
        productId,
        supplierId: product.supplierId,
        qty,
        unitPriceSen: overrideUnitPriceSen ?? resolveUnitPriceSen(product, qty),
      };
      state.cartItems.push(item);
      state.cartsByBuyer[buyerId] = [...existingIds, item.id];
    }
    return getCartItems(buyerId);
  }

  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  let { data: cart } = await supabase.from('carts').select('id').eq('buyer_id', buyerId).maybeSingle();
  if (!cart) {
    const { data: newCart } = await supabase.from('carts').insert({ buyer_id: buyerId }).select('id').single();
    cart = newCart;
  }
  const { data: product } = await supabase.from('products').select('*').eq('id', productId).single();
  if (!product || !cart) throw new Error('Product or cart not found');

  const unitPriceSen = overrideUnitPriceSen ?? product.base_price_sen; // tiered pricing resolved client-side on display; base used for storage default
  await supabase.from('cart_items').upsert(
    {
      cart_id: cart.id,
      product_id: productId,
      supplier_id: product.supplier_id,
      qty,
      unit_price_sen: unitPriceSen,
    },
    { onConflict: 'cart_id,product_id' },
  );
  return getCartItems(buyerId);
}

export async function updateCartItemQty(buyerId: string, cartItemId: string, qty: number): Promise<CartItem[]> {
  if (isDemoMode()) {
    const state = getState();
    const ownedIds = state.cartsByBuyer[buyerId] ?? [];
    if (!ownedIds.includes(cartItemId)) throw new Error('Cart item not found.');
    const item = state.cartItems.find((i) => i.id === cartItemId);
    if (item) {
      const product = state.products.find((p) => p.id === item.productId);
      item.qty = qty;
      if (product) item.unitPriceSen = resolveUnitPriceSen(product, qty);
    }
    return getCartItems(buyerId);
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data: cart } = await supabase.from('carts').select('id').eq('buyer_id', buyerId).maybeSingle();
  if (!cart) throw new Error('Cart not found.');
  await supabase.from('cart_items').update({ qty }).eq('id', cartItemId).eq('cart_id', cart.id);
  return getCartItems(buyerId);
}

export async function removeCartItem(buyerId: string, cartItemId: string): Promise<CartItem[]> {
  if (isDemoMode()) {
    const state = getState();
    const ownedIds = state.cartsByBuyer[buyerId] ?? [];
    if (!ownedIds.includes(cartItemId)) throw new Error('Cart item not found.');
    state.cartItems = state.cartItems.filter((i) => i.id !== cartItemId);
    state.cartsByBuyer[buyerId] = ownedIds.filter((id) => id !== cartItemId);
    return getCartItems(buyerId);
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data: cart } = await supabase.from('carts').select('id').eq('buyer_id', buyerId).maybeSingle();
  if (!cart) throw new Error('Cart not found.');
  await supabase.from('cart_items').delete().eq('id', cartItemId).eq('cart_id', cart.id);
  return getCartItems(buyerId);
}

export async function clearCart(buyerId: string): Promise<void> {
  if (isDemoMode()) {
    const state = getState();
    const ids = state.cartsByBuyer[buyerId] ?? [];
    state.cartItems = state.cartItems.filter((i) => !ids.includes(i.id));
    state.cartsByBuyer[buyerId] = [];
    return;
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data: cart } = await supabase.from('carts').select('id').eq('buyer_id', buyerId).maybeSingle();
  if (cart) await supabase.from('cart_items').delete().eq('cart_id', cart.id);
}
