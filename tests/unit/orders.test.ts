import { describe, expect, it } from 'vitest';
import {
  canRate,
  canTransition,
  generateOrderNumber,
  initialStatusForPaymentMethod,
  isTerminal,
  nextStatuses,
} from '@/lib/domain/orders';

describe('order status machine', () => {
  it('allows the documented happy-path delivery transitions', () => {
    expect(canTransition('pending_payment', 'payment_submitted')).toBe(true);
    expect(canTransition('payment_submitted', 'awaiting_supplier_confirmation')).toBe(true);
    expect(canTransition('awaiting_supplier_confirmation', 'confirmed')).toBe(true);
    expect(canTransition('confirmed', 'preparing')).toBe(true);
    expect(canTransition('preparing', 'out_for_delivery')).toBe(true);
    expect(canTransition('out_for_delivery', 'delivered')).toBe(true);
    expect(canTransition('delivered', 'completed')).toBe(true);
  });

  it('allows the pickup branch', () => {
    expect(canTransition('preparing', 'ready_for_pickup')).toBe(true);
    expect(canTransition('ready_for_pickup', 'completed')).toBe(true);
  });

  it('rejects illegal jumps', () => {
    expect(canTransition('pending_payment', 'completed')).toBe(false);
    expect(canTransition('cancelled', 'confirmed')).toBe(false);
  });

  it('has no forward transitions once cancelled (terminal)', () => {
    expect(nextStatuses('cancelled')).toEqual([]);
    expect(isTerminal('cancelled')).toBe(true);
    expect(isTerminal('completed')).toBe(true);
    expect(isTerminal('confirmed')).toBe(false);
  });

  it('allows disputes to be raised from delivered/completed and resolved back', () => {
    expect(canTransition('completed', 'disputed')).toBe(true);
    expect(canTransition('disputed', 'completed')).toBe(true);
    expect(canTransition('disputed', 'cancelled')).toBe(true);
  });
});

describe('canRate', () => {
  it('only allows rating a completed order', () => {
    expect(canRate('completed')).toBe(true);
    expect(canRate('delivered')).toBe(false);
    expect(canRate('cancelled')).toBe(false);
  });
});

describe('initialStatusForPaymentMethod', () => {
  it('starts bank transfer orders as pending_payment', () => {
    expect(initialStatusForPaymentMethod('bank_transfer')).toBe('pending_payment');
  });
  it('starts cash-based orders awaiting supplier confirmation', () => {
    expect(initialStatusForPaymentMethod('cod')).toBe('awaiting_supplier_confirmation');
    expect(initialStatusForPaymentMethod('cop')).toBe('awaiting_supplier_confirmation');
  });
});

describe('generateOrderNumber', () => {
  it('formats as TT-YYYYMM-NNNNN', () => {
    const date = new Date(2026, 8, 5); // September (0-indexed) 2026
    expect(generateOrderNumber(7, date)).toBe('TT-202609-00007');
    expect(generateOrderNumber(123456, date)).toBe('TT-202609-123456');
  });
});
