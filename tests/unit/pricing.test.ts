import { describe, expect, it } from 'vitest';
import { formatTierRange, lineTotalSen, resolveUnitPriceSen } from '@/lib/domain/pricing';
import type { PriceTier, Product } from '@/lib/domain/types';

const tiers: PriceTier[] = [
  { id: 't1', productId: 'p1', minQty: 1, maxQty: 9, pricePerUnitSen: 1200 },
  { id: 't2', productId: 'p1', minQty: 10, maxQty: 49, pricePerUnitSen: 1050 },
  { id: 't3', productId: 'p1', minQty: 50, pricePerUnitSen: 900 },
];

const product: Pick<Product, 'basePriceSen' | 'priceTiers'> = {
  basePriceSen: 1200,
  priceTiers: tiers,
};

describe('resolveUnitPriceSen', () => {
  it('uses the base price when there are no tiers', () => {
    expect(resolveUnitPriceSen({ basePriceSen: 1500, priceTiers: [] }, 100)).toBe(1500);
  });

  it('resolves the lowest tier for small quantities', () => {
    expect(resolveUnitPriceSen(product, 5)).toBe(1200);
  });

  it('resolves the middle tier at its lower boundary', () => {
    expect(resolveUnitPriceSen(product, 10)).toBe(1050);
  });

  it('resolves the middle tier at its upper boundary', () => {
    expect(resolveUnitPriceSen(product, 49)).toBe(1050);
  });

  it('resolves the open-ended top tier', () => {
    expect(resolveUnitPriceSen(product, 500)).toBe(900);
  });

  it('falls back to base price when qty is below every tier (defensive)', () => {
    const tiersStartingAtFive: PriceTier[] = [{ id: 't1', productId: 'p1', minQty: 5, pricePerUnitSen: 800 }];
    expect(resolveUnitPriceSen({ basePriceSen: 1000, priceTiers: tiersStartingAtFive }, 1)).toBe(1000);
  });
});

describe('formatTierRange', () => {
  it('formats a bounded tier', () => {
    expect(formatTierRange(tiers[1]!, 'kg')).toBe('10-49 kg');
  });
  it('formats an open-ended tier', () => {
    expect(formatTierRange(tiers[2]!, 'kg')).toBe('50+ kg');
  });
});

describe('lineTotalSen', () => {
  it('multiplies and rounds to the nearest sen', () => {
    expect(lineTotalSen(333, 3)).toBe(999);
  });
});
