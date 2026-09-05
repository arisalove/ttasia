import 'server-only';
import { isDemoMode } from '../supabase/env';
import { getState, nextId, nowIso } from './demo-store';
import type { DeliveryZone, Product, ProductUnit, SabahDistrict, SupplierProfile, SupplierVerificationDocument } from '../domain/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbVerificationDocument(row: any): SupplierVerificationDocument {
  return {
    id: row.id,
    supplierId: row.supplier_id,
    docType: row.doc_type,
    fileUrl: row.file_url,
    status: row.status,
    uploadedAt: row.uploaded_at,
    reviewedAt: row.reviewed_at ?? undefined,
    reviewNote: row.review_note ?? undefined,
  };
}

export async function getVerificationDocuments(supplierId: string): Promise<SupplierVerificationDocument[]> {
  if (isDemoMode()) {
    return getState().supplierVerificationDocuments.filter((d) => d.supplierId === supplierId);
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('supplier_verification_documents').select('*').eq('supplier_id', supplierId);
  return (data ?? []).map(mapDbVerificationDocument);
}

/**
 * Supplier "submits" a verification document. In this MVP the file itself
 * isn't persisted to storage (see README — wire up Supabase Storage's
 * `verification-docs` bucket in live mode); this records the submission and
 * moves the supplier into the admin review queue.
 */
export async function submitVerificationDocument(
  supplierId: string,
  docType: SupplierVerificationDocument['docType'],
  fileUrl: string,
): Promise<void> {
  if (isDemoMode()) {
    const state = getState();
    state.supplierVerificationDocuments.push({
      id: nextId('doc'),
      supplierId,
      docType,
      fileUrl,
      status: 'pending',
      uploadedAt: nowIso(),
    });
    const supplier = state.supplierProfiles.find((s) => s.id === supplierId);
    if (supplier && supplier.verificationStatus === 'unverified') {
      supplier.verificationStatus = 'pending';
    }
    return;
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  await supabase.from('supplier_verification_documents').insert({ supplier_id: supplierId, doc_type: docType, file_url: fileUrl, status: 'pending' });
  await supabase.from('supplier_profiles').update({ verification_status: 'pending' }).eq('id', supplierId).eq('verification_status', 'unverified');
}

export async function getSupplierProfile(supplierId: string): Promise<SupplierProfile | null> {
  if (isDemoMode()) return getState().supplierProfiles.find((s) => s.id === supplierId) ?? null;
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('supplier_profiles').select('*').eq('id', supplierId).single();
  return data
    ? {
        id: data.id,
        userId: data.user_id,
        businessProfileId: data.business_profile_id,
        storeSlug: data.store_slug,
        storeName: data.store_name,
        storeDescription: data.store_description,
        logoUrl: data.logo_url ?? undefined,
        bannerUrl: data.banner_url ?? undefined,
        categories: data.categories ?? [],
        supplierType: data.supplier_type,
        verificationStatus: data.verification_status,
        minimumOrderSen: data.minimum_order_sen,
        rating: Number(data.rating),
        ratingCount: data.rating_count,
        joinedAt: data.joined_at,
      }
    : null;
}

export async function updateSupplierProfile(
  supplierId: string,
  patch: Partial<Pick<SupplierProfile, 'storeName' | 'storeDescription' | 'minimumOrderSen' | 'logoUrl' | 'bannerUrl'>>,
): Promise<void> {
  if (isDemoMode()) {
    const supplier = getState().supplierProfiles.find((s) => s.id === supplierId);
    if (supplier) Object.assign(supplier, patch);
    return;
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  await supabase
    .from('supplier_profiles')
    .update({
      store_name: patch.storeName,
      store_description: patch.storeDescription,
      minimum_order_sen: patch.minimumOrderSen,
      logo_url: patch.logoUrl,
      banner_url: patch.bannerUrl,
    })
    .eq('id', supplierId);
}

export async function getProductsForSupplier(supplierId: string): Promise<Product[]> {
  if (isDemoMode()) return getState().products.filter((p) => p.supplierId === supplierId);
  const { createClient } = await import('../supabase/server');
  const { mapDbProduct } = await import('./catalogue');
  const supabase = await createClient();
  const { data } = await supabase.from('products').select('*, product_images(*), product_price_tiers(*)').eq('supplier_id', supplierId);
  return (data ?? []).map(mapDbProduct);
}

export interface UpsertProductInput {
  id?: string;
  supplierId: string;
  categoryId: string;
  name: string;
  nameMs?: string;
  description: string;
  unit: ProductUnit;
  packSize: string;
  basePriceSen: number;
  stockQty: number;
  minOrderQty: number;
  prepTimeHours: number;
  isHalal: boolean;
  imageUrl?: string;
  tiers?: { minQty: number; maxQty?: number; pricePerUnitSen: number }[];
}

export async function upsertProduct(input: UpsertProductInput): Promise<Product> {
  if (isDemoMode()) {
    const state = getState();
    if (input.id) {
      const existing = state.products.find((p) => p.id === input.id);
      if (!existing) throw new Error('Product not found');
      Object.assign(existing, {
        categoryId: input.categoryId,
        name: input.name,
        nameMs: input.nameMs,
        description: input.description,
        unit: input.unit,
        packSize: input.packSize,
        basePriceSen: input.basePriceSen,
        stockQty: input.stockQty,
        minOrderQty: input.minOrderQty,
        prepTimeHours: input.prepTimeHours,
        isHalal: input.isHalal,
      });
      if (input.imageUrl) existing.images = [{ id: nextId('img'), productId: existing.id, url: input.imageUrl, position: 0 }];
      if (input.tiers) {
        existing.priceTiers = input.tiers.map((t, i) => ({ id: `${existing.id}-tier-${i + 1}`, productId: existing.id, ...t }));
      }
      return existing;
    }
    const id = nextId('prod');
    const product: Product = {
      id,
      supplierId: input.supplierId,
      categoryId: input.categoryId,
      name: input.name,
      nameMs: input.nameMs,
      description: input.description,
      unit: input.unit,
      packSize: input.packSize,
      basePriceSen: input.basePriceSen,
      priceTiers: (input.tiers ?? []).map((t, i) => ({ id: `${id}-tier-${i + 1}`, productId: id, ...t })),
      images: input.imageUrl ? [{ id: nextId('img'), productId: id, url: input.imageUrl, position: 0 }] : [],
      stockQty: input.stockQty,
      minOrderQty: input.minOrderQty,
      prepTimeHours: input.prepTimeHours,
      isActive: true,
      isHalal: input.isHalal,
      createdAt: nowIso(),
    };
    state.products.unshift(product);
    return product;
  }

  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const payload = {
    supplier_id: input.supplierId,
    category_id: input.categoryId,
    name: input.name,
    name_ms: input.nameMs,
    description: input.description,
    unit: input.unit,
    pack_size: input.packSize,
    base_price_sen: input.basePriceSen,
    stock_qty: input.stockQty,
    min_order_qty: input.minOrderQty,
    prep_time_hours: input.prepTimeHours,
    is_halal: input.isHalal,
  };
  let productId = input.id;
  if (productId) {
    await supabase.from('products').update(payload).eq('id', productId);
  } else {
    const { data } = await supabase.from('products').insert(payload).select('id').single();
    productId = data.id;
  }
  if (input.imageUrl) {
    await supabase.from('product_images').insert({ product_id: productId, url: input.imageUrl, position: 0 });
  }
  if (input.tiers?.length) {
    await supabase.from('product_price_tiers').delete().eq('product_id', productId);
    await supabase.from('product_price_tiers').insert(
      input.tiers.map((t) => ({ product_id: productId, min_qty: t.minQty, max_qty: t.maxQty, price_per_unit_sen: t.pricePerUnitSen })),
    );
  }
  const { mapDbProduct } = await import('./catalogue');
  const { data: full } = await supabase.from('products').select('*, product_images(*), product_price_tiers(*)').eq('id', productId).single();
  return mapDbProduct(full);
}

export async function setProductActive(productId: string, isActive: boolean): Promise<void> {
  if (isDemoMode()) {
    const product = getState().products.find((p) => p.id === productId);
    if (product) product.isActive = isActive;
    return;
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  await supabase.from('products').update({ is_active: isActive }).eq('id', productId);
}

export async function updateStock(productId: string, stockQty: number): Promise<void> {
  if (isDemoMode()) {
    const product = getState().products.find((p) => p.id === productId);
    if (product) product.stockQty = stockQty;
    return;
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  await supabase.from('products').update({ stock_qty: stockQty }).eq('id', productId);
}

export async function getDeliveryZones(supplierId: string): Promise<DeliveryZone[]> {
  if (isDemoMode()) return getState().deliveryZones.filter((z) => z.supplierId === supplierId);
  const { createClient } = await import('../supabase/server');
  const { mapDbDeliveryZone } = await import('./catalogue');
  const supabase = await createClient();
  const { data } = await supabase.from('delivery_zones').select('*').eq('supplier_id', supplierId);
  return (data ?? []).map(mapDbDeliveryZone);
}

export async function upsertDeliveryZone(input: {
  id?: string;
  supplierId: string;
  district: SabahDistrict;
  deliveryFeeSen: number;
  freeDeliveryThresholdSen?: number;
  etaHoursMin: number;
  etaHoursMax: number;
}): Promise<DeliveryZone> {
  if (isDemoMode()) {
    const state = getState();
    if (input.id) {
      const existing = state.deliveryZones.find((z) => z.id === input.id);
      if (existing) {
        Object.assign(existing, input);
        return existing;
      }
    }
    const existingForDistrict = state.deliveryZones.find((z) => z.supplierId === input.supplierId && z.district === input.district);
    if (existingForDistrict) {
      Object.assign(existingForDistrict, input);
      return existingForDistrict;
    }
    const zone: DeliveryZone = { id: nextId('zone'), ...input };
    state.deliveryZones.push(zone);
    return zone;
  }
  const { createClient } = await import('../supabase/server');
  const { mapDbDeliveryZone } = await import('./catalogue');
  const supabase = await createClient();
  const { data } = await supabase
    .from('delivery_zones')
    .upsert(
      {
        id: input.id,
        supplier_id: input.supplierId,
        district: input.district,
        delivery_fee_sen: input.deliveryFeeSen,
        free_delivery_threshold_sen: input.freeDeliveryThresholdSen,
        eta_hours_min: input.etaHoursMin,
        eta_hours_max: input.etaHoursMax,
      },
      { onConflict: 'supplier_id,district' },
    )
    .select('*')
    .single();
  return mapDbDeliveryZone(data);
}

export async function removeDeliveryZone(zoneId: string): Promise<void> {
  if (isDemoMode()) {
    const state = getState();
    state.deliveryZones = state.deliveryZones.filter((z) => z.id !== zoneId);
    return;
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  await supabase.from('delivery_zones').delete().eq('id', zoneId);
}

export interface SalesSummary {
  totalOrders: number;
  completedOrders: number;
  totalRevenueSen: number;
  pendingOrders: number;
  last30DaysRevenueSen: number;
  revenueByDay: { date: string; revenueSen: number }[];
  topProducts: { productId: string; name: string; qtySold: number; revenueSen: number }[];
}

export async function getSalesSummary(supplierId: string): Promise<SalesSummary> {
  const { getOrdersForSupplier } = await import('./orders');
  const orders = await getOrdersForSupplier(supplierId);
  const revenueOrders = orders.filter((o) => o.status !== 'cancelled');

  const revenueByDayMap = new Map<string, number>();
  const productTotals = new Map<string, { name: string; qty: number; revenue: number }>();

  for (const order of revenueOrders) {
    const day = order.placedAt.slice(0, 10);
    revenueByDayMap.set(day, (revenueByDayMap.get(day) ?? 0) + order.totalSen);
    for (const item of order.items) {
      const existing = productTotals.get(item.productId) ?? { name: item.productName, qty: 0, revenue: 0 };
      existing.qty += item.qty;
      existing.revenue += item.lineTotalSen;
      productTotals.set(item.productId, existing);
    }
  }

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  return {
    totalOrders: orders.length,
    completedOrders: orders.filter((o) => o.status === 'completed').length,
    pendingOrders: orders.filter((o) => !['completed', 'cancelled', 'disputed'].includes(o.status)).length,
    totalRevenueSen: revenueOrders.reduce((sum, o) => sum + o.totalSen, 0),
    last30DaysRevenueSen: revenueOrders.filter((o) => new Date(o.placedAt).getTime() >= thirtyDaysAgo).reduce((sum, o) => sum + o.totalSen, 0),
    revenueByDay: Array.from(revenueByDayMap.entries())
      .map(([date, revenueSen]) => ({ date, revenueSen }))
      .sort((a, b) => (a.date > b.date ? 1 : -1)),
    topProducts: Array.from(productTotals.entries())
      .map(([productId, v]) => ({ productId, name: v.name, qtySold: v.qty, revenueSen: v.revenue }))
      .sort((a, b) => b.revenueSen - a.revenueSen)
      .slice(0, 5),
  };
}
