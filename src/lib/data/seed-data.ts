/**
 * Canonical demo/seed dataset for TapTap. Used by:
 *  - `src/lib/data/demo-store.ts` to power the in-memory "demo mode" backend
 *  - `supabase/seed/seed.ts` to populate a real Supabase project
 *
 * ALL businesses, people, phone numbers and documents below are FICTIONAL,
 * created for demonstration purposes only. Tawau is deliberately the most
 * densely-populated district, per the brief, while the schema/UI supports
 * every Sabah district and is written to extend across Malaysia later.
 */
import type {
  AppUser,
  BuyerProfile,
  BusinessProfile,
  Category,
  DeliveryZone,
  MessageThread,
  Message,
  Notification,
  Order,
  OrderItem,
  Product,
  ProductImage,
  PriceTier,
  Quotation,
  Review,
  SabahDistrict,
  SupplierProfile,
  SupplierVerificationDocument,
} from '../domain/types';

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const categories: Category[] = [
  { id: 'cat-veg', slug: 'vegetables-fruit', name: 'Fresh Vegetables & Fruit', nameMs: 'Sayur & Buah Segar', icon: 'carrot' },
  { id: 'cat-seafood', slug: 'seafood', name: 'Seafood', nameMs: 'Makanan Laut', icon: 'fish' },
  { id: 'cat-meat', slug: 'chicken-meat', name: 'Chicken & Meat', nameMs: 'Ayam & Daging', icon: 'drumstick' },
  { id: 'cat-frozen', slug: 'frozen', name: 'Frozen Products', nameMs: 'Produk Beku', icon: 'snowflake' },
  { id: 'cat-dry', slug: 'dry-ingredients', name: 'Dry Ingredients', nameMs: 'Bahan Kering', icon: 'wheat' },
  { id: 'cat-bev', slug: 'beverages', name: 'Beverages', nameMs: 'Minuman', icon: 'cup-soda' },
  { id: 'cat-bakery', slug: 'bakery-ingredients', name: 'Bakery Ingredients', nameMs: 'Bahan Bakeri', icon: 'croissant' },
  { id: 'cat-packaging', slug: 'food-packaging', name: 'Food Packaging', nameMs: 'Pembungkusan Makanan', icon: 'package' },
  { id: 'cat-cleaning', slug: 'cleaning-supplies', name: 'Cleaning Supplies', nameMs: 'Bekalan Pencucian', icon: 'spray-can' },
  { id: 'cat-kitchen', slug: 'kitchen-essentials', name: 'Commercial Kitchen Essentials', nameMs: 'Keperluan Dapur Komersial', icon: 'cooking-pot' },
];

// ---------------------------------------------------------------------------
// Users / business / buyer / supplier profiles
// ---------------------------------------------------------------------------

export const users: AppUser[] = [
  // Buyers
  { id: 'user-buyer-1', email: 'buyer@demo.taptap.my', fullName: 'Aiman Rizal', role: 'buyer', locale: 'en', createdAt: '2026-01-10T02:00:00Z' },
  { id: 'user-buyer-2', email: 'siti@demo.taptap.my', fullName: 'Siti Norlia', role: 'buyer', locale: 'ms', createdAt: '2026-02-04T02:00:00Z' },
  // Suppliers
  { id: 'user-sup-1', email: 'tawaufresh@demo.taptap.my', fullName: 'Jong Wei Ling', role: 'supplier', locale: 'en', createdAt: '2025-11-01T02:00:00Z' },
  { id: 'user-sup-2', email: 'borneodeepsea@demo.taptap.my', fullName: 'Sazali Bin Hussin', role: 'supplier', locale: 'en', createdAt: '2025-11-03T02:00:00Z' },
  { id: 'user-sup-3', email: 'ranauhighland@demo.taptap.my', fullName: 'Josephine Lojingki', role: 'supplier', locale: 'en', createdAt: '2025-11-05T02:00:00Z' },
  { id: 'user-sup-4', email: 'kkfrozen@demo.taptap.my', fullName: 'Alvin Chong', role: 'supplier', locale: 'en', createdAt: '2025-11-08T02:00:00Z' },
  { id: 'user-sup-5', email: 'sandakandry@demo.taptap.my', fullName: 'Faridah Ahmad', role: 'supplier', locale: 'ms', createdAt: '2025-11-10T02:00:00Z' },
  { id: 'user-sup-6', email: 'sabahbeverage@demo.taptap.my', fullName: 'Tan Kok Wei', role: 'supplier', locale: 'en', createdAt: '2025-11-12T02:00:00Z' },
  { id: 'user-sup-7', email: 'goldenwheat@demo.taptap.my', fullName: 'Nurul Huda', role: 'supplier', locale: 'ms', createdAt: '2025-11-14T02:00:00Z' },
  { id: 'user-sup-8', email: 'ecopacksabah@demo.taptap.my', fullName: 'Ronnie Majalap', role: 'supplier', locale: 'en', createdAt: '2025-11-16T02:00:00Z' },
  // Admin
  { id: 'user-admin-1', email: 'admin@demo.taptap.my', fullName: 'TapTap Ops', role: 'admin', locale: 'en', createdAt: '2025-10-01T02:00:00Z' },
];

export const businessProfiles: BusinessProfile[] = [
  { id: 'biz-buyer-1', ownerUserId: 'user-buyer-1', businessName: "Warung Sedap Tawau", registrationNumber: 'SSM-TWU-118820', address: 'Lot 12, Jalan Dunlop', district: 'Tawau', postcode: '91000', phone: '+60 89-772 100', createdAt: '2026-01-10T02:00:00Z' },
  { id: 'biz-buyer-2', ownerUserId: 'user-buyer-2', businessName: 'Kedai Kopi Siti', registrationNumber: 'SSM-KK-552310', address: '22 Jalan Gaya', district: 'Kota Kinabalu', postcode: '88000', phone: '+60 88-241 552', createdAt: '2026-02-04T02:00:00Z' },
  { id: 'biz-sup-1', ownerUserId: 'user-sup-1', businessName: 'Tawau Fresh Vegetable Co.', registrationNumber: 'SSM-TWU-004411', address: 'Tawau Wholesale Market, Jalan Stephen Tan', district: 'Tawau', postcode: '91000', phone: '+60 89-763 220', createdAt: '2025-11-01T02:00:00Z' },
  { id: 'biz-sup-2', ownerUserId: 'user-sup-2', businessName: 'Borneo Deep Sea Seafood', registrationNumber: 'SSM-SPN-009812', address: 'Jalan Kastam, Semporna Jetty', district: 'Semporna', postcode: '91308', phone: '+60 89-781 344', createdAt: '2025-11-03T02:00:00Z' },
  { id: 'biz-sup-3', ownerUserId: 'user-sup-3', businessName: 'Ranau Highland Poultry & Meats', registrationNumber: 'SSM-KGU-771230', address: 'Lot 5, Keningau Agro Park', district: 'Keningau', postcode: '89000', phone: '+60 87-338 219', createdAt: '2025-11-05T02:00:00Z' },
  { id: 'biz-sup-4', ownerUserId: 'user-sup-4', businessName: 'KK Frozen Solutions Sdn Bhd', registrationNumber: 'SSM-KK-336750', address: 'Kolombong Industrial Park, Unit 8', district: 'Kota Kinabalu', postcode: '88450', phone: '+60 88-423 981', createdAt: '2025-11-08T02:00:00Z' },
  { id: 'biz-sup-5', ownerUserId: 'user-sup-5', businessName: 'Sandakan Dry Goods Trading', registrationNumber: 'SSM-SDK-118763', address: 'Batu 4, Jalan Utara', district: 'Sandakan', postcode: '90000', phone: '+60 89-228 761', createdAt: '2025-11-10T02:00:00Z' },
  { id: 'biz-sup-6', ownerUserId: 'user-sup-6', businessName: 'Sabah Beverage Distributors', registrationNumber: 'SSM-KK-552901', address: 'Lorong Perindustrian Sepanggar 3', district: 'Kota Kinabalu', postcode: '88400', phone: '+60 88-499 022', createdAt: '2025-11-12T02:00:00Z' },
  { id: 'biz-sup-7', ownerUserId: 'user-sup-7', businessName: 'Golden Wheat Bakery Supplies', registrationNumber: 'SSM-PNP-227719', address: 'Donggongon New Township, Lot 14', district: 'Penampang', postcode: '89500', phone: '+60 88-761 340', createdAt: '2025-11-14T02:00:00Z' },
  { id: 'biz-sup-8', ownerUserId: 'user-sup-8', businessName: 'EcoPack Sabah', registrationNumber: 'SSM-PTT-889021', address: 'Putatan Business Centre, Block C', district: 'Putatan', postcode: '88200', phone: '+60 88-761 998', createdAt: '2025-11-16T02:00:00Z' },
  { id: 'biz-admin-1', ownerUserId: 'user-admin-1', businessName: 'TapTap Sdn Bhd', registrationNumber: 'SSM-KK-000001', address: 'Level 8, KK Times Square', district: 'Kota Kinabalu', postcode: '88100', phone: '+60 88-500 000', createdAt: '2025-10-01T02:00:00Z' },
];

export const buyerProfiles: BuyerProfile[] = [
  { id: 'buyer-1', userId: 'user-buyer-1', businessProfileId: 'biz-buyer-1', businessType: 'restaurant' },
  { id: 'buyer-2', userId: 'user-buyer-2', businessProfileId: 'biz-buyer-2', businessType: 'cafe' },
];

export const supplierProfiles: SupplierProfile[] = [
  {
    id: 'sup-1', userId: 'user-sup-1', businessProfileId: 'biz-sup-1', storeSlug: 'tawau-fresh-vegetable-co',
    storeName: 'Tawau Fresh Vegetable Co.', storeDescription: 'Daily fresh vegetables and tropical fruit sourced directly from Tawau smallholders and the Apas farming belt. Same-day harvest on most leafy greens.',
    categories: ['vegetables-fruit'], supplierType: 'farmer', verificationStatus: 'verified',
    minimumOrderSen: 8000, rating: 4.7, ratingCount: 86, joinedAt: '2025-11-01T02:00:00Z',
  },
  {
    id: 'sup-2', userId: 'user-sup-2', businessProfileId: 'biz-sup-2', storeSlug: 'borneo-deep-sea-seafood',
    storeName: 'Borneo Deep Sea Seafood', storeDescription: 'Wild-caught and farmed seafood landed daily at Semporna jetty — prawns, fish, squid and shellfish for restaurants and seafood eateries across Sabah.',
    categories: ['seafood'], supplierType: 'fisherman', verificationStatus: 'verified',
    minimumOrderSen: 15000, rating: 4.8, ratingCount: 142, joinedAt: '2025-11-03T02:00:00Z',
  },
  {
    id: 'sup-3', userId: 'user-sup-3', businessProfileId: 'biz-sup-3', storeSlug: 'ranau-highland-poultry-meats',
    storeName: 'Ranau Highland Poultry & Meats', storeDescription: 'Halal-certified chicken, beef and mutton from highland farms around Keningau and Ranau, processed at a licensed abattoir.',
    categories: ['chicken-meat'], supplierType: 'distributor', verificationStatus: 'verified',
    minimumOrderSen: 12000, rating: 4.6, ratingCount: 64, joinedAt: '2025-11-05T02:00:00Z',
  },
  {
    id: 'sup-4', userId: 'user-sup-4', businessProfileId: 'biz-sup-4', storeSlug: 'kk-frozen-solutions',
    storeName: 'KK Frozen Solutions', storeDescription: 'Cold-chain wholesaler for frozen meats, seafood, dumplings and ready-to-cook items — full Kota Kinabalu and surrounding districts coverage with refrigerated delivery.',
    categories: ['frozen'], supplierType: 'distributor', verificationStatus: 'verified',
    minimumOrderSen: 20000, rating: 4.5, ratingCount: 51, joinedAt: '2025-11-08T02:00:00Z',
  },
  {
    id: 'sup-5', userId: 'user-sup-5', businessProfileId: 'biz-sup-5', storeSlug: 'sandakan-dry-goods-trading',
    storeName: 'Sandakan Dry Goods Trading', storeDescription: 'Rice, flour, spices, sauces and pantry staples in bulk. Family-run trading house serving Sandakan-area kitchens for over 20 years.',
    categories: ['dry-ingredients'], supplierType: 'wholesaler', verificationStatus: 'verified',
    minimumOrderSen: 10000, rating: 4.4, ratingCount: 38, joinedAt: '2025-11-10T02:00:00Z',
  },
  {
    id: 'sup-6', userId: 'user-sup-6', businessProfileId: 'biz-sup-6', storeSlug: 'sabah-beverage-distributors',
    storeName: 'Sabah Beverage Distributors', storeDescription: 'Soft drinks, bottled water, syrups and cordial concentrates for cafés and restaurants, with bulk carton pricing.',
    categories: ['beverages'], supplierType: 'distributor', verificationStatus: 'verified',
    minimumOrderSen: 10000, rating: 4.3, ratingCount: 29, joinedAt: '2025-11-12T02:00:00Z',
  },
  {
    id: 'sup-7', userId: 'user-sup-7', businessProfileId: 'biz-sup-7', storeSlug: 'golden-wheat-bakery-supplies',
    storeName: 'Golden Wheat Bakery Supplies', storeDescription: 'Flour, yeast, butter, chocolate and baking essentials for bakeries and dessert cafés across the west coast.',
    categories: ['bakery-ingredients'], supplierType: 'manufacturer', verificationStatus: 'pending',
    minimumOrderSen: 15000, rating: 4.6, ratingCount: 21, joinedAt: '2025-11-14T02:00:00Z',
  },
  {
    id: 'sup-8', userId: 'user-sup-8', businessProfileId: 'biz-sup-8', storeSlug: 'ecopack-sabah',
    storeName: 'EcoPack Sabah', storeDescription: 'Food-grade packaging, disposables and cleaning/sanitation supplies for F&B outlets, with eco-friendly ranges available.',
    categories: ['food-packaging', 'cleaning-supplies', 'kitchen-essentials'], supplierType: 'wholesaler', verificationStatus: 'verified',
    minimumOrderSen: 6000, rating: 4.2, ratingCount: 33, joinedAt: '2025-11-16T02:00:00Z',
  },
];

export const supplierVerificationDocuments: SupplierVerificationDocument[] = supplierProfiles.map((s, i) => ({
  id: `doc-${i + 1}`,
  supplierId: s.id,
  docType: 'ssm_registration',
  fileUrl: '/demo/documents/ssm-registration-sample.pdf',
  status: s.verificationStatus === 'verified' ? 'approved' : 'pending',
  uploadedAt: s.joinedAt,
  reviewedAt: s.verificationStatus === 'verified' ? s.joinedAt : undefined,
}));

// ---------------------------------------------------------------------------
// Delivery zones — each supplier covers a spread of districts around home base
// ---------------------------------------------------------------------------

function zone(
  id: string,
  supplierId: string,
  district: SabahDistrict,
  feeRM: number,
  freeAboveRM: number | undefined,
  etaMin: number,
  etaMax: number,
): DeliveryZone {
  return {
    id,
    supplierId,
    district,
    deliveryFeeSen: feeRM * 100,
    freeDeliveryThresholdSen: freeAboveRM ? freeAboveRM * 100 : undefined,
    etaHoursMin: etaMin,
    etaHoursMax: etaMax,
  };
}

export const deliveryZones: DeliveryZone[] = [
  // sup-1 Tawau Fresh Vegetable Co — Tawau-centric
  zone('dz-1', 'sup-1', 'Tawau', 8, 150, 3, 8),
  zone('dz-2', 'sup-1', 'Semporna', 15, 200, 5, 12),
  zone('dz-3', 'sup-1', 'Kunak', 12, 180, 4, 10),
  zone('dz-4', 'sup-1', 'Lahad Datu', 18, 220, 6, 14),
  // sup-2 Borneo Deep Sea Seafood — Semporna-centric
  zone('dz-5', 'sup-2', 'Semporna', 10, 300, 2, 6),
  zone('dz-6', 'sup-2', 'Tawau', 20, 350, 4, 10),
  zone('dz-7', 'sup-2', 'Lahad Datu', 25, 350, 6, 14),
  // sup-3 Ranau Highland Poultry & Meats
  zone('dz-8', 'sup-3', 'Keningau', 10, 240, 3, 8),
  zone('dz-9', 'sup-3', 'Kota Kinabalu', 22, 300, 5, 12),
  zone('dz-10', 'sup-3', 'Kota Belud', 18, 280, 5, 12),
  // sup-4 KK Frozen Solutions
  zone('dz-11', 'sup-4', 'Kota Kinabalu', 15, 400, 4, 10),
  zone('dz-12', 'sup-4', 'Penampang', 15, 400, 4, 10),
  zone('dz-13', 'sup-4', 'Putatan', 15, 400, 4, 10),
  zone('dz-14', 'sup-4', 'Kota Belud', 25, 450, 6, 14),
  // sup-5 Sandakan Dry Goods Trading
  zone('dz-15', 'sup-5', 'Sandakan', 10, 200, 4, 10),
  zone('dz-16', 'sup-5', 'Lahad Datu', 20, 260, 6, 14),
  // sup-6 Sabah Beverage Distributors
  zone('dz-17', 'sup-6', 'Kota Kinabalu', 12, 300, 4, 10),
  zone('dz-18', 'sup-6', 'Penampang', 12, 300, 4, 10),
  zone('dz-19', 'sup-6', 'Putatan', 14, 300, 5, 12),
  // sup-7 Golden Wheat Bakery Supplies
  zone('dz-20', 'sup-7', 'Penampang', 10, 350, 4, 10),
  zone('dz-21', 'sup-7', 'Kota Kinabalu', 15, 350, 5, 12),
  // sup-8 EcoPack Sabah
  zone('dz-22', 'sup-8', 'Putatan', 8, 250, 3, 8),
  zone('dz-23', 'sup-8', 'Kota Kinabalu', 12, 250, 4, 10),
  zone('dz-24', 'sup-8', 'Penampang', 12, 250, 4, 10),
  zone('dz-25', 'sup-8', 'Tawau', 22, 300, 6, 14),
  // Long-haul Tawau coverage from west-coast suppliers (Tawau is TapTap's launch district)
  zone('dz-26', 'sup-3', 'Tawau', 35, 600, 10, 18),
  zone('dz-27', 'sup-4', 'Tawau', 40, 800, 10, 20),
];

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

let productSeq = 0;
function nextProductId() {
  productSeq += 1;
  return `prod-${productSeq}`;
}

interface SeedProductInput {
  supplierId: string;
  categoryId: string;
  name: string;
  nameMs?: string;
  description: string;
  unit: Product['unit'];
  packSize: string;
  basePriceRM: number;
  tiers?: { minQty: number; maxQty?: number; priceRM: number }[];
  stockQty: number;
  minOrderQty: number;
  prepTimeHours: number;
  isHalal?: boolean;
  image: string;
  isActive?: boolean;
}

function product(input: SeedProductInput): Product {
  const id = nextProductId();
  const priceTiers: PriceTier[] = (input.tiers ?? []).map((t, i) => ({
    id: `${id}-tier-${i + 1}`,
    productId: id,
    minQty: t.minQty,
    maxQty: t.maxQty,
    pricePerUnitSen: Math.round(t.priceRM * 100),
  }));
  const images: ProductImage[] = [{ id: `${id}-img-1`, productId: id, url: input.image, position: 0, altText: input.name }];
  return {
    id,
    supplierId: input.supplierId,
    categoryId: input.categoryId,
    name: input.name,
    nameMs: input.nameMs,
    description: input.description,
    unit: input.unit,
    packSize: input.packSize,
    basePriceSen: Math.round(input.basePriceRM * 100),
    priceTiers,
    images,
    stockQty: input.stockQty,
    minOrderQty: input.minOrderQty,
    prepTimeHours: input.prepTimeHours,
    isActive: input.isActive ?? true,
    isHalal: input.isHalal ?? true,
    createdAt: '2026-01-15T02:00:00Z',
  };
}

const IMG = {
  veg: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
  tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800',
  cucumber: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=800',
  chili: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=800',
  banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800',
  spinach: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800',
  onion: 'https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=800',
  fish: 'https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?w=800',
  prawn: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800',
  squid: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800',
  crab: 'https://images.unsplash.com/photo-1550747545-c896b5f89ff7?w=800',
  shellfish: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800',
  chicken: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=800',
  beef: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=800',
  mutton: 'https://images.unsplash.com/photo-1607116667981-27146f3a2b5b?w=800',
  sausage: 'https://images.unsplash.com/photo-1601924582970-9238bcb495d9?w=800',
  frozenDumpling: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800',
  frozenFries: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=800',
  frozenNugget: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800',
  iceCream: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800',
  rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800',
  flour: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
  spice: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800',
  soySauce: 'https://images.unsplash.com/photo-1585494156145-1c60a4fe952b?w=800',
  cookingOil: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800',
  softDrink: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800',
  water: 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=800',
  syrup: 'https://images.unsplash.com/photo-1571167530149-c72f2b6d5c1f?w=800',
  coffeeBeans: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800',
  bakeryFlour: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
  butter: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800',
  chocolate: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800',
  yeast: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
  eggs: 'https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=800',
  takeawayBox: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab0?w=800',
  cup: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800',
  cutlery: 'https://images.unsplash.com/photo-1584346133934-a3afd2a33c5f?w=800',
  glove: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=800',
  detergent: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800',
  sanitizer: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=800',
  trashBag: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=800',
  gasCanister: 'https://images.unsplash.com/photo-1585687433492-6bd35bd6a68e?w=800',
  panSet: 'https://images.unsplash.com/photo-1584990347449-a0d8f4f4c6f6?w=800',
} as const;

export const products: Product[] = [
  // ---- Supplier 1: Tawau Fresh Vegetable Co (vegetables & fruit) ----
  product({ supplierId: 'sup-1', categoryId: 'cat-veg', name: 'Cameron Highlands Cabbage', nameMs: 'Kobis Cameron', description: 'Crisp round cabbage, harvested and delivered within 48 hours.', unit: 'kg', packSize: 'Loose, sold by kg', basePriceRM: 3.2, tiers: [{ minQty: 1, maxQty: 19, priceRM: 3.2 }, { minQty: 20, maxQty: 49, priceRM: 2.8 }, { minQty: 50, priceRM: 2.4 }], stockQty: 400, minOrderQty: 5, prepTimeHours: 2, image: IMG.veg }),
  product({ supplierId: 'sup-1', categoryId: 'cat-veg', name: 'Ripe Tomatoes (Grade A)', nameMs: 'Tomato Merah Gred A', description: 'Vine-ripened tomatoes ideal for sauces, salads and garnish.', unit: 'kg', packSize: '10kg carton', basePriceRM: 4.5, tiers: [{ minQty: 1, maxQty: 29, priceRM: 4.5 }, { minQty: 30, priceRM: 3.9 }], stockQty: 250, minOrderQty: 10, prepTimeHours: 2, image: IMG.tomato }),
  product({ supplierId: 'sup-1', categoryId: 'cat-veg', name: 'Japanese Cucumber', nameMs: 'Timun Jepun', description: 'Thin-skinned cucumbers, great for salads and pickling.', unit: 'kg', packSize: 'Loose, sold by kg', basePriceRM: 3.8, stockQty: 180, minOrderQty: 5, prepTimeHours: 2, image: IMG.cucumber }),
  product({ supplierId: 'sup-1', categoryId: 'cat-veg', name: "Bird's Eye Chili (Cili Padi)", nameMs: 'Cili Padi', description: 'Fiery local chili, sorted and cleaned.', unit: 'kg', packSize: '5kg bag', basePriceRM: 14, tiers: [{ minQty: 1, maxQty: 9, priceRM: 14 }, { minQty: 10, priceRM: 12 }], stockQty: 90, minOrderQty: 2, prepTimeHours: 3, image: IMG.chili }),
  product({ supplierId: 'sup-1', categoryId: 'cat-veg', name: 'Pisang Awak Banana', nameMs: 'Pisang Awak', description: 'Sweet local bananas for desserts, goreng pisang and fruit plates.', unit: 'kg', packSize: 'Comb, ~13-15kg', basePriceRM: 2.6, stockQty: 300, minOrderQty: 10, prepTimeHours: 4, image: IMG.banana }),
  product({ supplierId: 'sup-1', categoryId: 'cat-veg', name: 'Local Spinach (Bayam)', nameMs: 'Bayam', description: 'Freshly cut bayam, harvested same-day for restaurants and stalls.', unit: 'kg', packSize: 'Bundled, sold by kg', basePriceRM: 5.0, stockQty: 120, minOrderQty: 3, prepTimeHours: 2, image: IMG.spinach }),
  product({ supplierId: 'sup-1', categoryId: 'cat-veg', name: 'Big Onion (India)', nameMs: 'Bawang Besar', description: 'Storage-grade big onions, low moisture for longer shelf life.', unit: 'kg', packSize: '25kg sack', basePriceRM: 3.6, tiers: [{ minQty: 1, maxQty: 24, priceRM: 3.6 }, { minQty: 25, priceRM: 3.2 }], stockQty: 500, minOrderQty: 5, prepTimeHours: 1, image: IMG.onion }),

  // ---- Supplier 2: Borneo Deep Sea Seafood ----
  product({ supplierId: 'sup-2', categoryId: 'cat-seafood', name: 'Fresh Mackerel (Ikan Kembung)', nameMs: 'Ikan Kembung', description: 'Whole mackerel, iced immediately after landing at Semporna jetty.', unit: 'kg', packSize: '10kg styrofoam box', basePriceRM: 16, tiers: [{ minQty: 1, maxQty: 19, priceRM: 16 }, { minQty: 20, priceRM: 14 }], stockQty: 150, minOrderQty: 5, prepTimeHours: 4, image: IMG.fish }),
  product({ supplierId: 'sup-2', categoryId: 'cat-seafood', name: 'Tiger Prawns (Udang Harimau)', nameMs: 'Udang Harimau', description: 'Large tiger prawns, sold head-on, sorted by size.', unit: 'kg', packSize: '5kg box', basePriceRM: 42, tiers: [{ minQty: 1, maxQty: 9, priceRM: 42 }, { minQty: 10, priceRM: 38 }], stockQty: 80, minOrderQty: 3, prepTimeHours: 4, image: IMG.prawn }),
  product({ supplierId: 'sup-2', categoryId: 'cat-seafood', name: 'Fresh Squid (Sotong)', nameMs: 'Sotong Segar', description: 'Cleaned squid tubes, ready for the wok or grill.', unit: 'kg', packSize: '10kg box', basePriceRM: 22, stockQty: 100, minOrderQty: 5, prepTimeHours: 4, image: IMG.squid }),
  product({ supplierId: 'sup-2', categoryId: 'cat-seafood', name: 'Mud Crab (Ketam Batu)', nameMs: 'Ketam Batu', description: 'Live-caught mud crab, tied and boxed for transport.', unit: 'kg', packSize: 'Box of ~8-10 crabs', basePriceRM: 55, stockQty: 40, minOrderQty: 2, prepTimeHours: 6, image: IMG.crab }),
  product({ supplierId: 'sup-2', categoryId: 'cat-seafood', name: 'Green Mussels (Kupang)', nameMs: 'Kupang', description: 'Farmed green mussels from Semporna waters, cleaned and bagged.', unit: 'kg', packSize: '10kg mesh bag', basePriceRM: 9, stockQty: 200, minOrderQty: 10, prepTimeHours: 3, image: IMG.shellfish }),
  product({ supplierId: 'sup-2', categoryId: 'cat-seafood', name: 'Grouper Fillet (Kerapu)', nameMs: 'Fillet Kerapu', description: 'Boneless grouper fillet, premium grade for fine dining.', unit: 'kg', packSize: 'Vacuum-packed 1kg', basePriceRM: 65, stockQty: 35, minOrderQty: 2, prepTimeHours: 5, image: IMG.fish }),

  // ---- Supplier 3: Ranau Highland Poultry & Meats ----
  product({ supplierId: 'sup-3', categoryId: 'cat-meat', name: 'Whole Chicken (Halal)', nameMs: 'Ayam Utuh (Halal)', description: 'Fresh-slaughtered whole chicken, halal-certified, cleaned and chilled.', unit: 'kg', packSize: '~1.2-1.4kg per bird', basePriceRM: 9.5, tiers: [{ minQty: 1, maxQty: 49, priceRM: 9.5 }, { minQty: 50, priceRM: 8.6 }], stockQty: 300, minOrderQty: 10, prepTimeHours: 6, image: IMG.chicken }),
  product({ supplierId: 'sup-3', categoryId: 'cat-meat', name: 'Chicken Breast Boneless', nameMs: 'Dada Ayam Tanpa Tulang', description: 'Trimmed boneless chicken breast, chilled, food-service cut.', unit: 'kg', packSize: '5kg bag', basePriceRM: 15, stockQty: 220, minOrderQty: 5, prepTimeHours: 6, image: IMG.chicken }),
  product({ supplierId: 'sup-3', categoryId: 'cat-meat', name: 'Beef Slices (Local)', nameMs: 'Hirisan Daging Lembu', description: 'Thin-sliced local beef, ideal for stir-fry and steamboat.', unit: 'kg', packSize: '2kg vacuum pack', basePriceRM: 32, stockQty: 90, minOrderQty: 2, prepTimeHours: 8, image: IMG.beef }),
  product({ supplierId: 'sup-3', categoryId: 'cat-meat', name: 'Mutton Cubes', nameMs: 'Kiub Daging Kambing', description: 'Diced mutton, well-trimmed, good for curry and soup.', unit: 'kg', packSize: '2kg pack', basePriceRM: 38, stockQty: 60, minOrderQty: 2, prepTimeHours: 8, image: IMG.mutton }),
  product({ supplierId: 'sup-3', categoryId: 'cat-meat', name: 'Chicken Sausage (Halal)', nameMs: 'Sosej Ayam (Halal)', description: 'Ready-to-cook chicken sausages for breakfast sets and stalls.', unit: 'packet', packSize: '1kg pack (~20pcs)', basePriceRM: 12, stockQty: 200, minOrderQty: 5, prepTimeHours: 4, image: IMG.sausage }),

  // ---- Supplier 4: KK Frozen Solutions ----
  product({ supplierId: 'sup-4', categoryId: 'cat-frozen', name: 'Frozen Chicken Dumplings', nameMs: 'Pau Sup Ayam Beku', description: 'Ready-to-steam chicken dumplings, 50pcs per pack.', unit: 'packet', packSize: '50 pcs / 1kg', basePriceRM: 18, stockQty: 150, minOrderQty: 4, prepTimeHours: 1, image: IMG.frozenDumpling }),
  product({ supplierId: 'sup-4', categoryId: 'cat-frozen', name: 'Frozen French Fries', nameMs: 'French Fries Beku', description: 'Straight-cut fries, restaurant grade, ready to deep-fry.', unit: 'box', packSize: '10 x 1kg per carton', basePriceRM: 65, tiers: [{ minQty: 1, maxQty: 4, priceRM: 65 }, { minQty: 5, priceRM: 58 }], stockQty: 80, minOrderQty: 2, prepTimeHours: 1, image: IMG.frozenFries }),
  product({ supplierId: 'sup-4', categoryId: 'cat-frozen', name: 'Frozen Chicken Nuggets', nameMs: 'Nugget Ayam Beku', description: 'Halal chicken nuggets, food-service pack.', unit: 'box', packSize: '1kg x 10 packs', basePriceRM: 72, stockQty: 70, minOrderQty: 2, prepTimeHours: 1, image: IMG.frozenNugget }),
  product({ supplierId: 'sup-4', categoryId: 'cat-frozen', name: 'Frozen Mixed Vegetables', nameMs: 'Sayur Campur Beku', description: 'IQF carrot, corn and pea mix for fried rice and sides.', unit: 'bag', packSize: '1kg bag', basePriceRM: 7.5, stockQty: 200, minOrderQty: 6, prepTimeHours: 1, image: IMG.frozenFries }),
  product({ supplierId: 'sup-4', categoryId: 'cat-frozen', name: 'Vanilla Ice Cream Tub', nameMs: 'Ais Krim Vanila', description: 'Food-service vanilla ice cream, great for desserts and drinks stalls.', unit: 'unit', packSize: '5L tub', basePriceRM: 38, stockQty: 45, minOrderQty: 1, prepTimeHours: 1, image: IMG.iceCream }),
  product({ supplierId: 'sup-4', categoryId: 'cat-frozen', name: 'Frozen Squid Rings', nameMs: 'Gelang Sotong Beku', description: 'Breaded squid rings, ready to fry, popular bar-snack item.', unit: 'box', packSize: '1kg x 10 packs', basePriceRM: 95, stockQty: 40, minOrderQty: 1, prepTimeHours: 1, image: IMG.squid }),

  // ---- Supplier 5: Sandakan Dry Goods Trading ----
  product({ supplierId: 'sup-5', categoryId: 'cat-dry', name: 'Jasmine Rice (Local Grade)', nameMs: 'Beras Wangi Tempatan', description: 'Everyday jasmine rice for restaurant service, sold by the sack.', unit: 'bag', packSize: '25kg sack', basePriceRM: 68, tiers: [{ minQty: 1, maxQty: 9, priceRM: 68 }, { minQty: 10, priceRM: 62 }], stockQty: 300, minOrderQty: 2, prepTimeHours: 2, image: IMG.rice }),
  product({ supplierId: 'sup-5', categoryId: 'cat-dry', name: 'Wheat Flour (All Purpose)', nameMs: 'Tepung Gandum Serbaguna', description: 'General-purpose wheat flour for cooking and light baking.', unit: 'bag', packSize: '25kg sack', basePriceRM: 52, stockQty: 180, minOrderQty: 2, prepTimeHours: 2, image: IMG.flour }),
  product({ supplierId: 'sup-5', categoryId: 'cat-dry', name: 'Curry Powder (Meat Blend)', nameMs: 'Serbuk Kari Daging', description: 'House-blend curry powder for meat curries, bulk pack.', unit: 'packet', packSize: '1kg pack', basePriceRM: 16, stockQty: 120, minOrderQty: 3, prepTimeHours: 2, image: IMG.spice }),
  product({ supplierId: 'sup-5', categoryId: 'cat-dry', name: 'Dark Soy Sauce', nameMs: 'Kicap Pekat', description: 'Bulk dark soy sauce for kitchens, food-service jug.', unit: 'bottle', packSize: '5L jug', basePriceRM: 22, stockQty: 90, minOrderQty: 2, prepTimeHours: 2, image: IMG.soySauce }),
  product({ supplierId: 'sup-5', categoryId: 'cat-dry', name: 'Cooking Oil (Palm)', nameMs: 'Minyak Masak Sawit', description: 'Refined palm cooking oil, restaurant-grade carton.', unit: 'carton', packSize: '17kg x 1 tin', basePriceRM: 78, tiers: [{ minQty: 1, maxQty: 4, priceRM: 78 }, { minQty: 5, priceRM: 72 }], stockQty: 150, minOrderQty: 1, prepTimeHours: 2, image: IMG.cookingOil }),
  product({ supplierId: 'sup-5', categoryId: 'cat-dry', name: 'White Sugar (Fine)', nameMs: 'Gula Pasir Halus', description: 'Fine white sugar, food-service bulk bag.', unit: 'bag', packSize: '50kg bag', basePriceRM: 145, stockQty: 60, minOrderQty: 1, prepTimeHours: 2, image: IMG.flour }),

  // ---- Supplier 6: Sabah Beverage Distributors ----
  product({ supplierId: 'sup-6', categoryId: 'cat-bev', name: 'Assorted Soft Drink Cans', nameMs: 'Tin Minuman Ringan', description: 'Mixed carbonated soft drinks, food-service carton.', unit: 'carton', packSize: '24 cans x 320ml', basePriceRM: 32, tiers: [{ minQty: 1, maxQty: 9, priceRM: 32 }, { minQty: 10, priceRM: 28 }], stockQty: 200, minOrderQty: 2, prepTimeHours: 1, image: IMG.softDrink }),
  product({ supplierId: 'sup-6', categoryId: 'cat-bev', name: 'Mineral Water Bottles', nameMs: 'Botol Air Mineral', description: 'Still mineral water, dine-in size, shrink-wrapped carton.', unit: 'carton', packSize: '24 x 500ml', basePriceRM: 14, stockQty: 300, minOrderQty: 2, prepTimeHours: 1, image: IMG.water }),
  product({ supplierId: 'sup-6', categoryId: 'cat-bev', name: 'Rose Syrup Concentrate', nameMs: 'Sirap Bandung Pekat', description: 'Concentrated rose syrup for air bandung and desserts.', unit: 'bottle', packSize: '2L bottle', basePriceRM: 11, stockQty: 100, minOrderQty: 3, prepTimeHours: 1, image: IMG.syrup }),
  product({ supplierId: 'sup-6', categoryId: 'cat-bev', name: 'Robusta Coffee Beans', nameMs: 'Biji Kopi Robusta', description: 'Locally roasted robusta beans for kopitiam-style brewing.', unit: 'bag', packSize: '1kg bag', basePriceRM: 28, stockQty: 70, minOrderQty: 2, prepTimeHours: 2, image: IMG.coffeeBeans }),
  product({ supplierId: 'sup-6', categoryId: 'cat-bev', name: 'Iced Lemon Tea Concentrate', nameMs: 'Pekat Teh O Ais Limau', description: 'Ready-mix lemon tea concentrate for beverage stalls.', unit: 'bottle', packSize: '1.5L bottle', basePriceRM: 13, stockQty: 90, minOrderQty: 3, prepTimeHours: 1, image: IMG.syrup }),

  // ---- Supplier 7: Golden Wheat Bakery Supplies ----
  product({ supplierId: 'sup-7', categoryId: 'cat-bakery', name: 'Bread Flour (High Protein)', nameMs: 'Tepung Roti Protein Tinggi', description: 'High-protein bread flour for bakeries and pastry kitchens.', unit: 'bag', packSize: '25kg sack', basePriceRM: 58, stockQty: 100, minOrderQty: 2, prepTimeHours: 3, image: IMG.bakeryFlour }),
  product({ supplierId: 'sup-7', categoryId: 'cat-bakery', name: 'Unsalted Butter Block', nameMs: 'Mentega Tawar', description: 'Food-service unsalted butter, chilled delivery.', unit: 'box', packSize: '10kg block', basePriceRM: 145, stockQty: 40, minOrderQty: 1, prepTimeHours: 3, image: IMG.butter }),
  product({ supplierId: 'sup-7', categoryId: 'cat-bakery', name: 'Compound Chocolate (Dark)', nameMs: 'Coklat Kompaun Gelap', description: 'Baking chocolate for cakes, cookies and coating.', unit: 'box', packSize: '5kg box', basePriceRM: 85, stockQty: 55, minOrderQty: 1, prepTimeHours: 3, image: IMG.chocolate }),
  product({ supplierId: 'sup-7', categoryId: 'cat-bakery', name: 'Instant Dry Yeast', nameMs: 'Yis Kering Segera', description: 'Instant yeast for bread and bun production.', unit: 'packet', packSize: '500g vacuum pack', basePriceRM: 18, stockQty: 80, minOrderQty: 2, prepTimeHours: 2, image: IMG.yeast }),
  product({ supplierId: 'sup-7', categoryId: 'cat-bakery', name: 'Fresh Chicken Eggs (Grade A)', nameMs: 'Telur Ayam Gred A', description: 'Farm-fresh grade A eggs, tray-packed for bakeries and cafés.', unit: 'tray', packSize: 'Tray of 30', basePriceRM: 13.5, tiers: [{ minQty: 1, maxQty: 19, priceRM: 13.5 }, { minQty: 20, priceRM: 12.2 }], stockQty: 260, minOrderQty: 4, prepTimeHours: 2, image: IMG.eggs }),

  // ---- Supplier 8: EcoPack Sabah (packaging, cleaning, kitchen essentials) ----
  product({ supplierId: 'sup-8', categoryId: 'cat-packaging', name: 'Kraft Paper Takeaway Box', nameMs: 'Kotak Bungkus Kertas Kraft', description: 'Biodegradable kraft takeaway boxes, medium size.', unit: 'box', packSize: '500 pcs per carton', basePriceRM: 95, tiers: [{ minQty: 1, maxQty: 4, priceRM: 95 }, { minQty: 5, priceRM: 85 }], stockQty: 120, minOrderQty: 1, prepTimeHours: 1, image: IMG.takeawayBox }),
  product({ supplierId: 'sup-8', categoryId: 'cat-packaging', name: 'PP Plastic Cups (16oz)', nameMs: 'Cawan Plastik PP (16oz)', description: 'Clear plastic cups for beverage stalls, dome-lid compatible.', unit: 'box', packSize: '1000 pcs per carton', basePriceRM: 68, stockQty: 100, minOrderQty: 1, prepTimeHours: 1, image: IMG.cup }),
  product({ supplierId: 'sup-8', categoryId: 'cat-packaging', name: 'Disposable Wooden Cutlery Set', nameMs: 'Set Kutleri Kayu Pakai Buang', description: 'Fork, spoon and napkin sets for takeaway orders.', unit: 'box', packSize: '500 sets per carton', basePriceRM: 55, stockQty: 90, minOrderQty: 1, prepTimeHours: 1, image: IMG.cutlery }),
  product({ supplierId: 'sup-8', categoryId: 'cat-cleaning', name: 'Food-Safe Nitrile Gloves', nameMs: 'Sarung Tangan Nitril', description: 'Powder-free nitrile gloves, food handling grade, size M.', unit: 'box', packSize: '100 pcs per box', basePriceRM: 22, stockQty: 200, minOrderQty: 2, prepTimeHours: 1, image: IMG.glove }),
  product({ supplierId: 'sup-8', categoryId: 'cat-cleaning', name: 'Concentrated Dishwashing Liquid', nameMs: 'Cecair Basuh Pinggan Pekat', description: 'Grease-cutting dishwashing liquid, food-service drum.', unit: 'bottle', packSize: '5L drum', basePriceRM: 32, stockQty: 130, minOrderQty: 2, prepTimeHours: 1, image: IMG.detergent }),
  product({ supplierId: 'sup-8', categoryId: 'cat-cleaning', name: 'Multi-Surface Sanitizer Spray', nameMs: 'Semburan Sanitasi Pelbagai Permukaan', description: 'Food-safe sanitizer spray for kitchen surfaces and equipment.', unit: 'bottle', packSize: '1L spray bottle', basePriceRM: 12, stockQty: 160, minOrderQty: 3, prepTimeHours: 1, image: IMG.sanitizer }),
  product({ supplierId: 'sup-8', categoryId: 'cat-cleaning', name: 'Heavy-Duty Trash Bags', nameMs: 'Beg Sampah Berat', description: 'Puncture-resistant trash bags for kitchen and back-of-house use.', unit: 'bag', packSize: '50 pcs per roll', basePriceRM: 18, stockQty: 140, minOrderQty: 2, prepTimeHours: 1, image: IMG.trashBag }),
  product({ supplierId: 'sup-8', categoryId: 'cat-kitchen', name: 'LPG Gas Canister Refill Voucher', nameMs: 'Baucar Isi Semula Gas LPG', description: 'Refill voucher redeemable at partner LPG depots — a placeholder demo product for kitchen essentials.', unit: 'unit', packSize: '14kg cylinder equivalent', basePriceRM: 62, stockQty: 999, minOrderQty: 1, prepTimeHours: 4, image: IMG.gasCanister }),
  product({ supplierId: 'sup-8', categoryId: 'cat-kitchen', name: 'Commercial Non-Stick Wok Set', nameMs: 'Set Kuali Anti Lekat Komersial', description: 'Heavy-gauge commercial wok, gas-stove compatible.', unit: 'unit', packSize: '1 unit, 40cm', basePriceRM: 89, stockQty: 25, minOrderQty: 1, prepTimeHours: 12, image: IMG.panSet }),
  product({ supplierId: 'sup-8', categoryId: 'cat-kitchen', name: 'Stainless Steel Gastronorm Pans', nameMs: 'Bekas Gastronorm Keluli Tahan Karat', description: 'GN 1/1 stainless steel pans for buffet and prep stations.', unit: 'unit', packSize: 'Set of 4', basePriceRM: 135, stockQty: 18, minOrderQty: 1, prepTimeHours: 12, isActive: true, image: IMG.panSet }),
];

// ---------------------------------------------------------------------------
// Orders (a spread of statuses), quotations, messages, notifications, reviews
// ---------------------------------------------------------------------------

function orderItemFor(p: Product, qty: number): OrderItem {
  return {
    id: `oi-${p.id}-${qty}`,
    orderId: '',
    productId: p.id,
    productName: p.name,
    unit: p.unit,
    qty,
    unitPriceSen: p.basePriceSen,
    lineTotalSen: p.basePriceSen * qty,
  };
}

const p = (id: string) => products.find((x) => x.id === id)!;

export const orders: Order[] = [
  {
    id: 'order-1', orderNumber: 'TT-202609-00001', buyerId: 'buyer-1', supplierId: 'sup-1',
    status: 'completed', fulfilmentMethod: 'delivery', district: 'Tawau', deliveryAddress: 'Lot 12, Jalan Dunlop, 91000 Tawau',
    paymentMethod: 'bank_transfer', subtotalSen: 15400, deliveryFeeSen: 0, totalSen: 15400,
    items: [orderItemFor(p('prod-1'), 20), orderItemFor(p('prod-2'), 20)].map((i) => ({ ...i, orderId: 'order-1' })),
    placedAt: '2026-08-10T03:00:00Z', updatedAt: '2026-08-11T09:00:00Z',
  },
  {
    id: 'order-2', orderNumber: 'TT-202609-00002', buyerId: 'buyer-1', supplierId: 'sup-3',
    status: 'out_for_delivery', fulfilmentMethod: 'delivery', district: 'Tawau', deliveryAddress: 'Lot 12, Jalan Dunlop, 91000 Tawau',
    paymentMethod: 'bank_transfer', subtotalSen: 95000, deliveryFeeSen: 0, totalSen: 95000,
    items: [orderItemFor(p('prod-14'), 100)].map((i) => ({ ...i, orderId: 'order-2' })),
    placedAt: '2026-09-02T01:30:00Z', updatedAt: '2026-09-04T06:00:00Z',
  },
  {
    id: 'order-3', orderNumber: 'TT-202609-00003', buyerId: 'buyer-1', supplierId: 'sup-2',
    status: 'awaiting_supplier_confirmation', fulfilmentMethod: 'pickup',
    paymentMethod: 'cop', subtotalSen: 16800, deliveryFeeSen: 0, totalSen: 16800,
    items: [orderItemFor(p('prod-9'), 4)].map((i) => ({ ...i, orderId: 'order-3' })),
    placedAt: '2026-09-04T23:00:00Z', updatedAt: '2026-09-04T23:00:00Z',
  },
  {
    id: 'order-4', orderNumber: 'TT-202609-00004', buyerId: 'buyer-2', supplierId: 'sup-6',
    status: 'pending_payment', fulfilmentMethod: 'delivery', district: 'Kota Kinabalu', deliveryAddress: '22 Jalan Gaya, 88000 Kota Kinabalu',
    paymentMethod: 'bank_transfer', subtotalSen: 12800, deliveryFeeSen: 1200, totalSen: 14000,
    items: [orderItemFor(p('prod-31'), 4)].map((i) => ({ ...i, orderId: 'order-4' })),
    placedAt: '2026-09-05T00:10:00Z', updatedAt: '2026-09-05T00:10:00Z',
  },
  {
    id: 'order-5', orderNumber: 'TT-202608-00099', buyerId: 'buyer-2', supplierId: 'sup-7',
    status: 'confirmed', fulfilmentMethod: 'delivery', district: 'Kota Kinabalu', deliveryAddress: '22 Jalan Gaya, 88000 Kota Kinabalu',
    paymentMethod: 'bank_transfer', subtotalSen: 29000, deliveryFeeSen: 1500, totalSen: 30500,
    items: [orderItemFor(p('prod-36'), 5)].map((i) => ({ ...i, orderId: 'order-5' })),
    placedAt: '2026-08-28T05:00:00Z', updatedAt: '2026-08-29T02:00:00Z',
  },
  {
    id: 'order-6', orderNumber: 'TT-202608-00088', buyerId: 'buyer-1', supplierId: 'sup-4',
    status: 'disputed', fulfilmentMethod: 'delivery', district: 'Tawau', deliveryAddress: 'Lot 12, Jalan Dunlop, 91000 Tawau',
    paymentMethod: 'bank_transfer', subtotalSen: 130000, deliveryFeeSen: 2200, totalSen: 132200,
    items: [orderItemFor(p('prod-20'), 20)].map((i) => ({ ...i, orderId: 'order-6' })),
    placedAt: '2026-08-20T04:00:00Z', updatedAt: '2026-08-22T07:00:00Z',
    cancelReason: undefined,
  },
  {
    id: 'order-7', orderNumber: 'TT-202608-00077', buyerId: 'buyer-1', supplierId: 'sup-1',
    status: 'cancelled', fulfilmentMethod: 'pickup',
    paymentMethod: 'cop', subtotalSen: 9500, deliveryFeeSen: 0, totalSen: 9500,
    items: [orderItemFor(p('prod-3'), 25)].map((i) => ({ ...i, orderId: 'order-7' })),
    placedAt: '2026-08-15T02:00:00Z', updatedAt: '2026-08-15T05:00:00Z',
    cancelReason: 'Buyer found a closer alternative for this one-off order.',
  },
];

export const reviews: Review[] = [
  { id: 'rev-1', orderId: 'order-1', buyerId: 'buyer-1', supplierId: 'sup-1', rating: 5, comment: 'Sayur sangat segar dan cepat sampai. Akan order lagi!', createdAt: '2026-08-11T10:00:00Z' },
];

export const quotations: Quotation[] = [
  {
    id: 'quote-1', quotationNumber: 'RFQ-202609-00001', buyerId: 'buyer-1', supplierId: 'sup-3',
    status: 'quoted', message: 'Need weekly bulk chicken supply for a new banquet contract — please advise best rate for 200kg/week.',
    supplierResponse: 'We can commit to RM8.20/kg for a standing weekly order of 200kg+, delivered. Valid for 14 days.',
    validUntil: '2026-09-19T00:00:00Z', totalSen: 164000, createdAt: '2026-09-01T03:00:00Z', updatedAt: '2026-09-02T05:00:00Z',
    items: [
      { id: 'qi-1', quotationId: 'quote-1', productId: 'prod-14', description: 'Whole Chicken (Halal) — weekly standing order', qty: 200, unit: 'kg', proposedPriceSen: 820 },
    ],
  },
  {
    id: 'quote-2', quotationNumber: 'RFQ-202609-00002', buyerId: 'buyer-2', supplierId: 'sup-8',
    status: 'requested', message: 'Looking for a monthly packaging bundle (boxes + cups + cutlery) for a new outlet opening. Please quote.',
    createdAt: '2026-09-04T08:00:00Z', updatedAt: '2026-09-04T08:00:00Z',
    items: [
      { id: 'qi-2', quotationId: 'quote-2', productId: 'prod-41', description: 'Kraft Paper Takeaway Box', qty: 10, unit: 'box' },
      { id: 'qi-3', quotationId: 'quote-2', productId: 'prod-42', description: 'PP Plastic Cups (16oz)', qty: 6, unit: 'box' },
    ],
  },
];

export const messageThreads: MessageThread[] = [
  { id: 'thread-1', buyerId: 'buyer-1', supplierId: 'sup-1', lastMessageAt: '2026-09-04T12:00:00Z', lastMessagePreview: 'Boleh tak hantar esok pagi sebelum jam 8?' },
  { id: 'thread-2', buyerId: 'buyer-1', supplierId: 'sup-3', lastMessageAt: '2026-09-02T05:00:00Z', lastMessagePreview: 'We can commit to RM8.20/kg for a standing weekly order...' },
];

export const messages: Message[] = [
  { id: 'msg-1', threadId: 'thread-1', senderId: 'user-buyer-1', senderRole: 'buyer', body: 'Selamat pagi! Nak tanya, sayur untuk esok boleh hantar awal sikit?', createdAt: '2026-09-04T11:50:00Z', readAt: '2026-09-04T12:05:00Z' },
  { id: 'msg-2', threadId: 'thread-1', senderId: 'user-sup-1', senderRole: 'supplier', body: 'Boleh tak hantar esok pagi sebelum jam 8?', createdAt: '2026-09-04T12:00:00Z' },
  { id: 'msg-3', threadId: 'thread-2', senderId: 'user-sup-3', senderRole: 'supplier', body: 'We can commit to RM8.20/kg for a standing weekly order of 200kg+, delivered. Valid for 14 days.', createdAt: '2026-09-02T05:00:00Z', readAt: '2026-09-02T06:00:00Z' },
];

export const notifications: Notification[] = [
  { id: 'notif-1', userId: 'user-buyer-1', type: 'order_status', title: 'Order out for delivery', body: 'Your order TT-202609-00002 from Ranau Highland Poultry & Meats is out for delivery.', href: '/buyer/orders/order-2', createdAt: '2026-09-04T06:00:00Z' },
  { id: 'notif-2', userId: 'user-buyer-1', type: 'quotation', title: 'Quotation received', body: 'Ranau Highland Poultry & Meats sent a quote for your RFQ.', href: '/buyer/rfq', createdAt: '2026-09-02T05:00:00Z', readAt: '2026-09-02T06:00:00Z' },
  { id: 'notif-3', userId: 'user-sup-1', type: 'message', title: 'New message', body: 'Warung Sedap Tawau sent you a message.', href: '/supplier/messages', createdAt: '2026-09-04T11:50:00Z' },
  { id: 'notif-4', userId: 'user-sup-7', type: 'verification', title: 'Verification pending', body: 'Your supplier verification is still under review by TapTap Ops.', href: '/supplier/verification', createdAt: '2025-11-15T00:00:00Z' },
  { id: 'notif-5', userId: 'user-admin-1', type: 'verification', title: 'New supplier awaiting review', body: 'Golden Wheat Bakery Supplies submitted documents for verification.', href: '/admin/verification', createdAt: '2025-11-14T02:30:00Z' },
];
