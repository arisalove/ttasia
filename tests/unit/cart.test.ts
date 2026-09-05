import { describe, expect, it } from 'vitest';
import {
  cartTotalSen,
  checkMinimumOrders,
  canProceedToCheckout,
  groupCartBySupplier,
  resolveDeliveryFeeSen,
  validateCartItemAgainstProduct,
} from '@/lib/domain/cart';
import type { CartItem, DeliveryZone, Product } from '@/lib/domain/types';

function item(overrides: Partial<CartItem>): CartItem {
  return {
    id: 'item-1',
    productId: 'prod-1',
    supplierId: 'sup-1',
    qty: 1,
    unitPriceSen: 1000,
    ...overrides,
  };
}

describe('groupCartBySupplier', () => {
  it('splits a multi-supplier cart into one group per supplier', () => {
    const items: CartItem[] = [
      item({ id: 'a', supplierId: 'sup-1', qty: 2, unitPriceSen: 500 }),
      item({ id: 'b', supplierId: 'sup-2', qty: 3, unitPriceSen: 1000 }),
      item({ id: 'c', supplierId: 'sup-1', qty: 1, unitPriceSen: 500 }),
    ];

    const groups = groupCartBySupplier(items);

    expect(groups).toHaveLength(2);
    const sup1 = groups.find((g) => g.supplierId === 'sup-1')!;
    const sup2 = groups.find((g) => g.supplierId === 'sup-2')!;
    expect(sup1.items).toHaveLength(2);
    expect(sup1.subtotalSen).toBe(500 * 2 + 500 * 1);
    expect(sup2.subtotalSen).toBe(1000 * 3);
  });

  it('returns an empty array for an empty cart', () => {
    expect(groupCartBySupplier([])).toEqual([]);
  });
});

describe('checkMinimumOrders / canProceedToCheckout', () => {
  it('blocks checkout when a supplier group is under its MOQ', () => {
    const groups = groupCartBySupplier([
      item({ id: 'a', supplierId: 'sup-1', qty: 1, unitPriceSen: 2000 }), // RM20
      item({ id: 'b', supplierId: 'sup-2', qty: 1, unitPriceSen: 10000 }), // RM100
    ]);

    const results = checkMinimumOrders(groups, { 'sup-1': 5000, 'sup-2': 5000 });

    const sup1 = results.find((r) => r.supplierId === 'sup-1')!;
    const sup2 = results.find((r) => r.supplierId === 'sup-2')!;
    expect(sup1.meetsMinimum).toBe(false);
    expect(sup1.shortfallSen).toBe(3000);
    expect(sup2.meetsMinimum).toBe(true);
    expect(canProceedToCheckout(results)).toBe(false);
  });

  it('allows checkout once every supplier group clears its minimum', () => {
    const groups = groupCartBySupplier([item({ supplierId: 'sup-1', qty: 10, unitPriceSen: 1000 })]);
    const results = checkMinimumOrders(groups, { 'sup-1': 5000 });
    expect(canProceedToCheckout(results)).toBe(true);
  });

  it('treats an empty cart as unable to proceed', () => {
    expect(canProceedToCheckout([])).toBe(false);
  });
});

describe('validateCartItemAgainstProduct', () => {
  const baseProduct: Pick<Product, 'stockQty' | 'minOrderQty' | 'isActive'> = {
    stockQty: 20,
    minOrderQty: 5,
    isActive: true,
  };

  it('flags below-MOQ quantities', () => {
    const result = validateCartItemAgainstProduct(item({ qty: 2 }), baseProduct);
    expect(result).toEqual({ ok: false, reason: 'below_moq' });
  });

  it('flags quantities exceeding available stock', () => {
    const result = validateCartItemAgainstProduct(item({ qty: 50 }), baseProduct);
    expect(result).toEqual({ ok: false, reason: 'insufficient_stock' });
  });

  it('flags inactive listings before anything else', () => {
    const result = validateCartItemAgainstProduct(item({ qty: 50 }), { ...baseProduct, isActive: false });
    expect(result).toEqual({ ok: false, reason: 'inactive' });
  });

  it('passes a valid line item', () => {
    const result = validateCartItemAgainstProduct(item({ qty: 10 }), baseProduct);
    expect(result).toEqual({ ok: true });
  });
});

describe('resolveDeliveryFeeSen', () => {
  const zones: DeliveryZone[] = [
    {
      id: 'z1',
      supplierId: 'sup-1',
      district: 'Tawau',
      deliveryFeeSen: 1500,
      freeDeliveryThresholdSen: 20000,
      etaHoursMin: 2,
      etaHoursMax: 6,
    },
  ];

  it('is free for self-pickup regardless of district', () => {
    expect(resolveDeliveryFeeSen('pickup', undefined, 0, zones)).toEqual({
      feeSen: 0,
      districtCovered: true,
    });
  });

  it('charges the zone fee below the free-delivery threshold', () => {
    const result = resolveDeliveryFeeSen('delivery', 'Tawau', 10000, zones);
    expect(result.feeSen).toBe(1500);
    expect(result.districtCovered).toBe(true);
  });

  it('waives the fee once the subtotal clears the free-delivery threshold', () => {
    const result = resolveDeliveryFeeSen('delivery', 'Tawau', 25000, zones);
    expect(result.feeSen).toBe(0);
  });

  it('flags a district the supplier does not deliver to', () => {
    const result = resolveDeliveryFeeSen('delivery', 'Semporna', 10000, zones);
    expect(result.districtCovered).toBe(false);
  });
});

describe('cartTotalSen', () => {
  it('sums line totals across all items', () => {
    const items = [item({ qty: 2, unitPriceSen: 500 }), item({ id: 'b', qty: 3, unitPriceSen: 700 })];
    expect(cartTotalSen(items)).toBe(2 * 500 + 3 * 700);
  });
});
