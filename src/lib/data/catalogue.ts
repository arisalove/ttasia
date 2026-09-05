import 'server-only';
import { isDemoMode } from '../supabase/env';
import { getState } from './demo-store';
import type { Category, DeliveryZone, Product, SupplierProfile } from '../domain/types';

export interface ProductFilters {
  categorySlug?: string;
  supplierId?: string;
  search?: string;
  district?: string;
  minPriceSen?: number;
  maxPriceSen?: number;
  halalOnly?: boolean;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  pageSize?: number;
}

export interface ProductListResult {
  items: (Product & { supplier: SupplierProfile; category: Category })[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getCategories(): Promise<Category[]> {
  if (isDemoMode()) {
    const { categories } = await import('./seed-data');
    return categories;
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('categories').select('*').order('name');
  return (data ?? []).map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    nameMs: c.name_ms,
    icon: c.icon,
    parentId: c.parent_id ?? undefined,
  }));
}

export async function getProducts(filters: ProductFilters = {}): Promise<ProductListResult> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;

  if (isDemoMode()) {
    const state = getState();
    const { categories } = await import('./seed-data');
    const verifiedSupplierIds = new Set(
      state.supplierProfiles.filter((s) => s.verificationStatus === 'verified').map((s) => s.id),
    );
    // Only verified suppliers' catalogues are visible to buyers — unverified/pending
    // storefronts are still fully manageable from the supplier dashboard, they just
    // don't appear in the public catalogue/search until Admin approves them.
    let items = state.products.filter((p) => p.isActive && verifiedSupplierIds.has(p.supplierId));

    if (filters.categorySlug) {
      const cat = categories.find((c) => c.slug === filters.categorySlug);
      if (cat) items = items.filter((p) => p.categoryId === cat.id);
    }
    if (filters.supplierId) {
      items = items.filter((p) => p.supplierId === filters.supplierId);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.nameMs?.toLowerCase().includes(q),
      );
    }
    if (filters.district) {
      const supplierIdsInDistrict = new Set(
        state.deliveryZones.filter((z) => z.district === filters.district).map((z) => z.supplierId),
      );
      items = items.filter((p) => supplierIdsInDistrict.has(p.supplierId));
    }
    if (filters.minPriceSen != null) items = items.filter((p) => p.basePriceSen >= filters.minPriceSen!);
    if (filters.maxPriceSen != null) items = items.filter((p) => p.basePriceSen <= filters.maxPriceSen!);
    if (filters.halalOnly) items = items.filter((p) => p.isHalal);

    switch (filters.sort) {
      case 'price_asc':
        items = [...items].sort((a, b) => a.basePriceSen - b.basePriceSen);
        break;
      case 'price_desc':
        items = [...items].sort((a, b) => b.basePriceSen - a.basePriceSen);
        break;
      case 'newest':
        items = [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
        break;
      default:
        break;
    }

    const total = items.length;
    const start = (page - 1) * pageSize;
    const pageItems = items.slice(start, start + pageSize).map((prod) => ({
      ...prod,
      supplier: state.supplierProfiles.find((s) => s.id === prod.supplierId)!,
      category: categories.find((c) => c.id === prod.categoryId)!,
    }));

    return { items: pageItems, total, page, pageSize };
  }

  // Live mode
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  let query = supabase
    .from('products')
    .select('*, product_images(*), product_price_tiers(*), supplier_profiles(*)', { count: 'exact' })
    .eq('is_active', true);

  if (filters.categorySlug) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', filters.categorySlug).single();
    if (cat) query = query.eq('category_id', cat.id);
  }
  if (filters.supplierId) query = query.eq('supplier_id', filters.supplierId);
  if (filters.search) query = query.textSearch('name', filters.search);
  if (filters.minPriceSen != null) query = query.gte('base_price_sen', filters.minPriceSen);
  if (filters.maxPriceSen != null) query = query.lte('base_price_sen', filters.maxPriceSen);
  if (filters.halalOnly) query = query.eq('is_halal', true);

  const start = (page - 1) * pageSize;
  const { data, count } = await query.range(start, start + pageSize - 1);

  return {
    items: (data ?? []).map(mapDbProduct),
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getProductById(id: string) {
  if (isDemoMode()) {
    const state = getState();
    const { categories } = await import('./seed-data');
    const prod = state.products.find((p) => p.id === id);
    if (!prod) return null;
    return {
      ...prod,
      supplier: state.supplierProfiles.find((s) => s.id === prod.supplierId)!,
      category: categories.find((c) => c.id === prod.categoryId)!,
    };
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('*, product_images(*), product_price_tiers(*), supplier_profiles(*)')
    .eq('id', id)
    .single();
  return data ? mapDbProduct(data) : null;
}

export async function getSupplierBySlug(slug: string) {
  if (isDemoMode()) {
    const state = getState();
    return state.supplierProfiles.find((s) => s.storeSlug === slug) ?? null;
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('supplier_profiles').select('*').eq('store_slug', slug).single();
  return data ? mapDbSupplier(data) : null;
}

export async function getSuppliers(): Promise<SupplierProfile[]> {
  if (isDemoMode()) {
    return getState().supplierProfiles.filter((s) => s.verificationStatus === 'verified');
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('supplier_profiles').select('*').eq('verification_status', 'verified');
  return (data ?? []).map(mapDbSupplier);
}

export async function getDeliveryZonesForSupplier(supplierId: string): Promise<DeliveryZone[]> {
  if (isDemoMode()) {
    return getState().deliveryZones.filter((z) => z.supplierId === supplierId);
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('delivery_zones').select('*').eq('supplier_id', supplierId);
  return (data ?? []).map(mapDbDeliveryZone);
}

// ---- mapping helpers (DB snake_case -> domain camelCase) ----

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapDbProduct(row: any): Product & { supplier: SupplierProfile; category: Category } {
  return {
    id: row.id,
    supplierId: row.supplier_id,
    categoryId: row.category_id,
    name: row.name,
    nameMs: row.name_ms ?? undefined,
    description: row.description,
    unit: row.unit,
    packSize: row.pack_size,
    basePriceSen: row.base_price_sen,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    priceTiers: (row.product_price_tiers ?? []).map((t: any) => ({
      id: t.id,
      productId: t.product_id,
      minQty: t.min_qty,
      maxQty: t.max_qty ?? undefined,
      pricePerUnitSen: t.price_per_unit_sen,
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    images: (row.product_images ?? []).map((i: any) => ({
      id: i.id,
      productId: i.product_id,
      url: i.url,
      position: i.position,
      altText: i.alt_text ?? undefined,
    })),
    stockQty: row.stock_qty,
    minOrderQty: row.min_order_qty,
    prepTimeHours: row.prep_time_hours,
    isActive: row.is_active,
    isHalal: row.is_halal,
    createdAt: row.created_at,
    supplier: row.supplier_profiles ? mapDbSupplier(row.supplier_profiles) : (undefined as unknown as SupplierProfile),
    category: undefined as unknown as Category,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapDbDeliveryZone(z: any): DeliveryZone {
  return {
    id: z.id,
    supplierId: z.supplier_id,
    district: z.district,
    deliveryFeeSen: z.delivery_fee_sen,
    freeDeliveryThresholdSen: z.free_delivery_threshold_sen ?? undefined,
    etaHoursMin: z.eta_hours_min,
    etaHoursMax: z.eta_hours_max,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapDbSupplier(row: any): SupplierProfile {
  return {
    id: row.id,
    userId: row.user_id,
    businessProfileId: row.business_profile_id,
    storeSlug: row.store_slug,
    storeName: row.store_name,
    storeDescription: row.store_description,
    logoUrl: row.logo_url ?? undefined,
    bannerUrl: row.banner_url ?? undefined,
    categories: row.categories ?? [],
    supplierType: row.supplier_type,
    verificationStatus: row.verification_status,
    minimumOrderSen: row.minimum_order_sen,
    rating: Number(row.rating),
    ratingCount: row.rating_count,
    joinedAt: row.joined_at,
  };
}
