import type { CartItem, DeliveryZone, FulfilmentMethod, Product, SabahDistrict } from './types';
import { lineTotalSen } from './pricing';
import { sumSen, type Sen } from '../utils/money';

export interface SupplierGroup {
  supplierId: string;
  items: CartItem[];
  subtotalSen: Sen;
}

/**
 * A cart may contain products from several suppliers. At checkout we split it
 * into one order per supplier, since each supplier has independent MOQ,
 * delivery fees and delivery coverage. Order within each group is stable.
 */
export function groupCartBySupplier(items: CartItem[]): SupplierGroup[] {
  const bySupplier = new Map<string, CartItem[]>();
  for (const item of items) {
    const list = bySupplier.get(item.supplierId) ?? [];
    list.push(item);
    bySupplier.set(item.supplierId, list);
  }

  return Array.from(bySupplier.entries()).map(([supplierId, groupItems]) => ({
    supplierId,
    items: groupItems,
    subtotalSen: sumSen(groupItems.map((i) => lineTotalSen(i.unitPriceSen, i.qty))),
  }));
}

export interface MoqCheckResult {
  supplierId: string;
  meetsMinimum: boolean;
  subtotalSen: Sen;
  minimumOrderSen: Sen;
  shortfallSen: Sen;
}

/**
 * Checkout must be blocked per-supplier if that supplier's minimum-order
 * requirement is not met. `minimumOrderByySupplier` maps supplierId -> MOQ in sen.
 */
export function checkMinimumOrders(
  groups: SupplierGroup[],
  minimumOrderBySupplier: Record<string, Sen>,
): MoqCheckResult[] {
  return groups.map((group) => {
    const minimumOrderSen = minimumOrderBySupplier[group.supplierId] ?? 0;
    const meetsMinimum = group.subtotalSen >= minimumOrderSen;
    return {
      supplierId: group.supplierId,
      meetsMinimum,
      subtotalSen: group.subtotalSen,
      minimumOrderSen,
      shortfallSen: meetsMinimum ? 0 : minimumOrderSen - group.subtotalSen,
    };
  });
}

export function canProceedToCheckout(results: MoqCheckResult[]): boolean {
  return results.length > 0 && results.every((r) => r.meetsMinimum);
}

/** Also flags out-of-stock or below-MOQ single line items so the UI can warn inline. */
export function validateCartItemAgainstProduct(
  item: CartItem,
  product: Pick<Product, 'stockQty' | 'minOrderQty' | 'isActive'>,
): { ok: true } | { ok: false; reason: 'inactive' | 'out_of_stock' | 'below_moq' | 'insufficient_stock' } {
  if (!product.isActive) return { ok: false, reason: 'inactive' };
  if (product.stockQty <= 0) return { ok: false, reason: 'out_of_stock' };
  if (item.qty < product.minOrderQty) return { ok: false, reason: 'below_moq' };
  if (item.qty > product.stockQty) return { ok: false, reason: 'insufficient_stock' };
  return { ok: true };
}

export function resolveDeliveryFeeSen(
  method: FulfilmentMethod,
  district: SabahDistrict | undefined,
  subtotalSen: Sen,
  zones: DeliveryZone[],
): { feeSen: Sen; zone?: DeliveryZone; districtCovered: boolean } {
  if (method === 'pickup') return { feeSen: 0, districtCovered: true };
  const zone = zones.find((z) => z.district === district);
  if (!zone) return { feeSen: 0, districtCovered: false };
  const freeThreshold = zone.freeDeliveryThresholdSen;
  const feeSen = freeThreshold != null && subtotalSen >= freeThreshold ? 0 : zone.deliveryFeeSen;
  return { feeSen, zone, districtCovered: true };
}

export function cartTotalSen(items: CartItem[]): Sen {
  return sumSen(items.map((i) => lineTotalSen(i.unitPriceSen, i.qty)));
}
