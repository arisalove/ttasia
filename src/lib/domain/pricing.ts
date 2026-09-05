import type { PriceTier, Product } from './types';
import type { Sen } from '../utils/money';

/**
 * Resolve the correct unit price for a given quantity using the product's
 * wholesale price tiers (e.g. 1-9 kg = RM12/kg, 10-49 kg = RM10.50/kg, 50+ = RM9/kg).
 * Falls back to the product's base price when no tier matches or none are defined.
 */
export function resolveUnitPriceSen(product: Pick<Product, 'basePriceSen' | 'priceTiers'>, qty: number): Sen {
  if (!product.priceTiers?.length) return product.basePriceSen;

  const sorted = [...product.priceTiers].sort((a, b) => a.minQty - b.minQty);
  let matched: PriceTier | undefined;
  for (const tier of sorted) {
    const withinMax = tier.maxQty == null || qty <= tier.maxQty;
    if (qty >= tier.minQty && withinMax) {
      matched = tier;
    }
  }
  return matched ? matched.pricePerUnitSen : product.basePriceSen;
}

/** Human-readable tier label, e.g. "10-49 kg" or "50+ kg". */
export function formatTierRange(tier: PriceTier, unit: string): string {
  return tier.maxQty != null ? `${tier.minQty}-${tier.maxQty} ${unit}` : `${tier.minQty}+ ${unit}`;
}

export function lineTotalSen(unitPriceSen: Sen, qty: number): Sen {
  return Math.round(unitPriceSen * qty);
}
