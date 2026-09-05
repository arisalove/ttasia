import 'server-only';
import { isDemoMode } from '../supabase/env';
import { getState, nextId, nowIso } from './demo-store';
import { groupCartBySupplier, checkMinimumOrders, resolveDeliveryFeeSen, validateCartItemAgainstProduct } from '../domain/cart';
import { lineTotalSen } from '../domain/pricing';
import { canTransition, generateOrderNumber, initialStatusForPaymentMethod } from '../domain/orders';
import { clearCart, getCartItems } from './cart';
import type { CartItem, FulfilmentMethod, Order, OrderStatus, PaymentMethod, SabahDistrict } from '../domain/types';

export async function getOrdersForBuyer(buyerId: string): Promise<Order[]> {
  if (isDemoMode()) {
    return getState()
      .orders.filter((o) => o.buyerId === buyerId)
      .sort((a, b) => (a.placedAt < b.placedAt ? 1 : -1));
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('buyer_id', buyerId)
    .order('placed_at', { ascending: false });
  return (data ?? []).map(mapDbOrder);
}

export async function getOrdersForSupplier(supplierId: string): Promise<Order[]> {
  if (isDemoMode()) {
    return getState()
      .orders.filter((o) => o.supplierId === supplierId)
      .sort((a, b) => (a.placedAt < b.placedAt ? 1 : -1));
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('supplier_id', supplierId)
    .order('placed_at', { ascending: false });
  return (data ?? []).map(mapDbOrder);
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  if (isDemoMode()) {
    return getState().orders.find((o) => o.id === orderId) ?? null;
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('orders').select('*, order_items(*)').eq('id', orderId).single();
  return data ? mapDbOrder(data) : null;
}

export interface CheckoutInput {
  buyerId: string;
  fulfilmentMethod: FulfilmentMethod;
  district?: SabahDistrict;
  deliveryAddress?: string;
  paymentMethod: PaymentMethod;
}

export interface CheckoutResult {
  ok: boolean;
  orders?: Order[];
  errors?: { supplierId: string; message: string }[];
}

/**
 * The core "split a multi-supplier cart into one order per supplier" flow.
 * Validates each supplier group against its MOQ and delivery coverage before
 * committing anything — either every eligible group becomes an order, or
 * the whole checkout is rejected with per-supplier reasons.
 */
export async function checkoutCart(input: CheckoutInput): Promise<CheckoutResult> {
  const items = await getCartItems(input.buyerId);
  if (items.length === 0) return { ok: false, errors: [{ supplierId: '', message: 'Your cart is empty.' }] };

  // Re-validate every line against the product's *current* state: a product
  // may have gone inactive, sold out, or had its stock/MOQ changed by the
  // supplier since it was added to the cart, so checkout must not trust the
  // cart snapshot alone.
  const stockErrors = await validateCartAgainstCatalogue(items);
  if (stockErrors.length > 0) return { ok: false, errors: stockErrors };

  const groups = groupCartBySupplier(items);
  const { getDeliveryZonesForSupplier } = await import('./catalogue');

  const minimumOrderBySupplier: Record<string, number> = {};
  const zonesBySupplier: Record<string, Awaited<ReturnType<typeof getDeliveryZonesForSupplier>>> = {};

  if (isDemoMode()) {
    const state = getState();
    for (const group of groups) {
      const supplier = state.supplierProfiles.find((s) => s.id === group.supplierId);
      minimumOrderBySupplier[group.supplierId] = supplier?.minimumOrderSen ?? 0;
      zonesBySupplier[group.supplierId] = await getDeliveryZonesForSupplier(group.supplierId);
    }
  } else {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();
    for (const group of groups) {
      const { data: supplier } = await supabase
        .from('supplier_profiles')
        .select('minimum_order_sen')
        .eq('id', group.supplierId)
        .single();
      minimumOrderBySupplier[group.supplierId] = supplier?.minimum_order_sen ?? 0;
      zonesBySupplier[group.supplierId] = await getDeliveryZonesForSupplier(group.supplierId);
    }
  }

  const moqResults = checkMinimumOrders(groups, minimumOrderBySupplier);
  const errors: { supplierId: string; message: string }[] = [];

  for (const result of moqResults) {
    if (!result.meetsMinimum) {
      errors.push({
        supplierId: result.supplierId,
        message: `Minimum order not met — add another ${(result.shortfallSen / 100).toFixed(2)} RM to checkout with this supplier.`,
      });
    }
  }

  if (input.fulfilmentMethod === 'delivery' && !input.district) {
    errors.push({ supplierId: '', message: 'Select a delivery district to continue.' });
  }

  if (errors.length > 0) return { ok: false, errors };

  const createdOrders: Order[] = [];

  for (const group of groups) {
    const { feeSen, districtCovered } = resolveDeliveryFeeSen(
      input.fulfilmentMethod,
      input.district,
      group.subtotalSen,
      zonesBySupplier[group.supplierId] ?? [],
    );
    if (input.fulfilmentMethod === 'delivery' && !districtCovered) {
      errors.push({ supplierId: group.supplierId, message: `This supplier does not deliver to ${input.district}.` });
      continue;
    }

    const order = await createOrderForSupplier(group.supplierId, group.items, input, feeSen);
    createdOrders.push(order);
  }

  if (errors.length > 0) return { ok: false, errors };

  await clearCart(input.buyerId);
  return { ok: true, orders: createdOrders };
}

const VALIDATION_MESSAGES: Record<'inactive' | 'out_of_stock' | 'below_moq' | 'insufficient_stock', string> = {
  inactive: 'is no longer available',
  out_of_stock: 'is out of stock',
  below_moq: "doesn't meet this product's minimum order quantity",
  insufficient_stock: 'does not have enough stock for the quantity in your cart',
};

/**
 * Checks every cart line against the product's live stock/active/MOQ state
 * (see `validateCartItemAgainstProduct`), which is never trusted at the
 * moment the item was added to the cart — a supplier can deactivate a
 * product, sell out, or change its MOQ at any time before checkout.
 */
async function validateCartAgainstCatalogue(items: CartItem[]): Promise<{ supplierId: string; message: string }[]> {
  const errors: { supplierId: string; message: string }[] = [];

  if (isDemoMode()) {
    const state = getState();
    for (const item of items) {
      const product = state.products.find((p) => p.id === item.productId);
      if (!product) {
        errors.push({ supplierId: item.supplierId, message: 'One of the items in your cart no longer exists.' });
        continue;
      }
      const result = validateCartItemAgainstProduct(item, product);
      if (!result.ok) {
        errors.push({ supplierId: item.supplierId, message: `${product.name} ${VALIDATION_MESSAGES[result.reason]}.` });
      }
    }
    return errors;
  }

  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const productIds = [...new Set(items.map((i) => i.productId))];
  const { data: products } = await supabase
    .from('products')
    .select('id, name, stock_qty, min_order_qty, is_active')
    .in('id', productIds);

  for (const item of items) {
    const product = products?.find((p) => p.id === item.productId);
    if (!product) {
      errors.push({ supplierId: item.supplierId, message: 'One of the items in your cart no longer exists.' });
      continue;
    }
    const result = validateCartItemAgainstProduct(item, {
      stockQty: product.stock_qty,
      minOrderQty: product.min_order_qty,
      isActive: product.is_active,
    });
    if (!result.ok) {
      errors.push({ supplierId: item.supplierId, message: `${product.name} ${VALIDATION_MESSAGES[result.reason]}.` });
    }
  }
  return errors;
}

async function createOrderForSupplier(
  supplierId: string,
  items: CartItem[],
  input: CheckoutInput,
  deliveryFeeSen: number,
): Promise<Order> {
  const subtotalSen = items.reduce((sum, i) => sum + lineTotalSen(i.unitPriceSen, i.qty), 0);
  const totalSen = subtotalSen + deliveryFeeSen;
  const status = initialStatusForPaymentMethod(input.paymentMethod);

  if (isDemoMode()) {
    const state = getState();
    const orderId = nextId('order');
    const orderNumber = generateOrderNumber(state.seq);
    const order: Order = {
      id: orderId,
      orderNumber,
      buyerId: input.buyerId,
      supplierId,
      status,
      fulfilmentMethod: input.fulfilmentMethod,
      district: input.district,
      deliveryAddress: input.deliveryAddress,
      paymentMethod: input.paymentMethod,
      subtotalSen,
      deliveryFeeSen,
      totalSen,
      items: items.map((i) => {
        const product = state.products.find((p) => p.id === i.productId)!;
        return {
          id: nextId('order-item'),
          orderId,
          productId: i.productId,
          productName: product.name,
          unit: product.unit,
          qty: i.qty,
          unitPriceSen: i.unitPriceSen,
          lineTotalSen: lineTotalSen(i.unitPriceSen, i.qty),
        };
      }),
      placedAt: nowIso(),
      updatedAt: nowIso(),
    };
    state.orders.unshift(order);

    // Decrement stock
    for (const i of items) {
      const product = state.products.find((p) => p.id === i.productId);
      if (product) product.stockQty = Math.max(0, product.stockQty - i.qty);
    }

    // Notify the supplier
    const supplier = state.supplierProfiles.find((s) => s.id === supplierId);
    if (supplier) {
      state.notifications.unshift({
        id: nextId('notif'),
        userId: supplier.userId,
        type: 'order_status',
        title: 'New order received',
        body: `You have a new order ${orderNumber} for ${(totalSen / 100).toFixed(2)} RM.`,
        href: `/supplier/orders/${orderId}`,
        createdAt: nowIso(),
      });
    }

    return order;
  }

  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data: orderRow } = await supabase
    .from('orders')
    .insert({
      buyer_id: input.buyerId,
      supplier_id: supplierId,
      status,
      fulfilment_method: input.fulfilmentMethod,
      district: input.district,
      delivery_address: input.deliveryAddress,
      payment_method: input.paymentMethod,
      subtotal_sen: subtotalSen,
      delivery_fee_sen: deliveryFeeSen,
      total_sen: totalSen,
    })
    .select('*')
    .single();

  const orderId = orderRow.id as string;
  const { data: products } = await supabase
    .from('products')
    .select('id, name, unit')
    .in(
      'id',
      items.map((i) => i.productId),
    );

  const orderItems = items.map((i) => {
    const p = products?.find((pr) => pr.id === i.productId);
    return {
      order_id: orderId,
      product_id: i.productId,
      product_name: p?.name ?? 'Product',
      unit: p?.unit ?? 'unit',
      qty: i.qty,
      unit_price_sen: i.unitPriceSen,
      line_total_sen: lineTotalSen(i.unitPriceSen, i.qty),
    };
  });
  await supabase.from('order_items').insert(orderItems);
  await supabase.from('payments').insert({
    order_id: orderId,
    method: input.paymentMethod,
    amount_sen: totalSen,
    status: 'unpaid',
    provider: 'manual',
  });

  return (await getOrderById(orderId))!;
}

export async function updateOrderStatus(
  orderId: string,
  toStatus: OrderStatus,
  actorUserId: string,
  note?: string,
): Promise<Order> {
  if (isDemoMode()) {
    const state = getState();
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');
    if (!canTransition(order.status, toStatus)) {
      throw new Error(`Cannot move order from ${order.status} to ${toStatus}`);
    }
    order.status = toStatus;
    order.updatedAt = nowIso();

    state.auditLogs.unshift({
      id: nextId('audit'),
      actorUserId,
      actorRole: state.users.find((u) => u.id === actorUserId)?.role ?? 'buyer',
      action: 'order.status_changed',
      targetType: 'order',
      targetId: orderId,
      metadata: { toStatus, note },
      createdAt: nowIso(),
    });

    // Notify the buyer of the status change
    const buyer = state.buyerProfiles.find((b) => b.id === order.buyerId);
    if (buyer) {
      state.notifications.unshift({
        id: nextId('notif'),
        userId: buyer.userId,
        type: 'order_status',
        title: 'Order status updated',
        body: `Order ${order.orderNumber} is now "${toStatus.replace(/_/g, ' ')}".`,
        href: `/buyer/orders/${orderId}`,
        createdAt: nowIso(),
      });
    }

    return order;
  }

  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const current = await getOrderById(orderId);
  if (!current) throw new Error('Order not found');
  if (!canTransition(current.status, toStatus)) {
    throw new Error(`Cannot move order from ${current.status} to ${toStatus}`);
  }
  await supabase.from('orders').update({ status: toStatus }).eq('id', orderId);
  await supabase.from('order_status_history').insert({
    order_id: orderId,
    from_status: current.status,
    to_status: toStatus,
    changed_by: actorUserId,
    note,
  });
  await supabase.from('audit_logs').insert({
    actor_user_id: actorUserId,
    action: 'order.status_changed',
    target_type: 'order',
    target_id: orderId,
    metadata: { toStatus, note },
  });
  return (await getOrderById(orderId))!;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapDbOrder(row: any): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    buyerId: row.buyer_id,
    supplierId: row.supplier_id,
    status: row.status,
    fulfilmentMethod: row.fulfilment_method,
    district: row.district ?? undefined,
    deliveryAddress: row.delivery_address ?? undefined,
    paymentMethod: row.payment_method,
    subtotalSen: row.subtotal_sen,
    deliveryFeeSen: row.delivery_fee_sen,
    totalSen: row.total_sen,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: (row.order_items ?? []).map((i: any) => ({
      id: i.id,
      orderId: i.order_id,
      productId: i.product_id,
      productName: i.product_name,
      unit: i.unit,
      qty: Number(i.qty),
      unitPriceSen: i.unit_price_sen,
      lineTotalSen: i.line_total_sen,
    })),
    placedAt: row.placed_at,
    updatedAt: row.updated_at,
    isReorderOf: row.is_reorder_of ?? undefined,
    isFromQuotationId: row.is_from_quotation_id ?? undefined,
    cancelReason: row.cancel_reason ?? undefined,
  };
}
