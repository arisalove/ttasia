import type { OrderStatus, PaymentMethod, UserRole } from './types';

/**
 * Legal forward transitions for an order's status. Cancellation and disputes
 * are reachable from most "in-flight" states; terminal states have none.
 */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ['payment_submitted', 'awaiting_supplier_confirmation', 'cancelled'],
  payment_submitted: ['awaiting_supplier_confirmation', 'cancelled', 'disputed'],
  awaiting_supplier_confirmation: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready_for_pickup', 'out_for_delivery', 'cancelled'],
  ready_for_pickup: ['completed', 'disputed'],
  out_for_delivery: ['delivered', 'disputed'],
  delivered: ['completed', 'disputed'],
  completed: ['disputed'],
  cancelled: [],
  disputed: ['completed', 'cancelled'],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function nextStatuses(from: OrderStatus): OrderStatus[] {
  return TRANSITIONS[from] ?? [];
}

/** Which role is expected to trigger each transition, for UI gating. */
export function actorForTransition(to: OrderStatus): UserRole | 'buyer_or_supplier' {
  switch (to) {
    case 'payment_submitted':
      return 'buyer';
    case 'awaiting_supplier_confirmation':
      return 'buyer';
    case 'confirmed':
    case 'preparing':
    case 'ready_for_pickup':
    case 'out_for_delivery':
      return 'supplier';
    case 'delivered':
      return 'buyer_or_supplier';
    case 'completed':
      return 'buyer';
    case 'cancelled':
      return 'buyer_or_supplier';
    case 'disputed':
      return 'buyer_or_supplier';
    default:
      return 'buyer_or_supplier';
  }
}

/** Only orders in a terminal, fulfilled state may be rated. */
export function canRate(status: OrderStatus): boolean {
  return status === 'completed';
}

export function isTerminal(status: OrderStatus): boolean {
  return status === 'completed' || status === 'cancelled';
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, { en: string; ms: string }> = {
  pending_payment: { en: 'Pending payment', ms: 'Menunggu bayaran' },
  payment_submitted: { en: 'Payment submitted', ms: 'Bayaran dihantar' },
  awaiting_supplier_confirmation: { en: 'Awaiting supplier confirmation', ms: 'Menunggu pengesahan pembekal' },
  confirmed: { en: 'Confirmed', ms: 'Disahkan' },
  preparing: { en: 'Preparing', ms: 'Sedang disiapkan' },
  ready_for_pickup: { en: 'Ready for pickup', ms: 'Sedia untuk diambil' },
  out_for_delivery: { en: 'Out for delivery', ms: 'Dalam penghantaran' },
  delivered: { en: 'Delivered', ms: 'Telah dihantar' },
  completed: { en: 'Completed', ms: 'Selesai' },
  cancelled: { en: 'Cancelled', ms: 'Dibatalkan' },
  disputed: { en: 'Disputed', ms: 'Dipertikaikan' },
};

/** Initial status depends on the chosen payment method. */
export function initialStatusForPaymentMethod(method: PaymentMethod): OrderStatus {
  if (method === 'bank_transfer') return 'pending_payment';
  return 'awaiting_supplier_confirmation'; // COD / self-pickup cash: pay on fulfilment
}

export function generateOrderNumber(sequence: number, date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `TT-${y}${m}-${String(sequence).padStart(5, '0')}`;
}
