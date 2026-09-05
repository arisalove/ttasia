/**
 * Domain types shared across the app. These mirror the Postgres schema in
 * supabase/migrations/0001_init.sql — keep the two in sync when either changes.
 * Monetary values are always integer "sen" (see lib/utils/money.ts).
 */

export type UUID = string;
export type ISODateTime = string;

export type Locale = 'en' | 'ms';

export type UserRole = 'buyer' | 'supplier' | 'admin';

export type SabahDistrict =
  | 'Tawau'
  | 'Kota Kinabalu'
  | 'Sandakan'
  | 'Lahad Datu'
  | 'Semporna'
  | 'Kunak'
  | 'Keningau'
  | 'Kota Belud'
  | 'Penampang'
  | 'Putatan';

export const SABAH_DISTRICTS: SabahDistrict[] = [
  'Tawau',
  'Kota Kinabalu',
  'Sandakan',
  'Lahad Datu',
  'Semporna',
  'Kunak',
  'Keningau',
  'Kota Belud',
  'Penampang',
  'Putatan',
];

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected' | 'suspended';

export interface AppUser {
  id: UUID;
  email: string;
  phone?: string;
  fullName: string;
  role: UserRole;
  locale: Locale;
  avatarUrl?: string;
  createdAt: ISODateTime;
  suspended?: boolean;
}

export interface BusinessProfile {
  id: UUID;
  ownerUserId: UUID;
  businessName: string;
  registrationNumber: string;
  address: string;
  district: SabahDistrict;
  postcode?: string;
  phone: string;
  createdAt: ISODateTime;
}

export interface BuyerProfile {
  id: UUID;
  userId: UUID;
  businessProfileId: UUID;
  businessType:
    | 'restaurant'
    | 'cafe'
    | 'bakery'
    | 'catering'
    | 'food_stall'
    | 'hotel'
    | 'other';
}

export interface DeliveryZone {
  id: UUID;
  supplierId: UUID;
  district: SabahDistrict;
  deliveryFeeSen: number;
  freeDeliveryThresholdSen?: number;
  etaHoursMin: number;
  etaHoursMax: number;
}

export interface SupplierProfile {
  id: UUID;
  userId: UUID;
  businessProfileId: UUID;
  storeSlug: string;
  storeName: string;
  storeDescription: string;
  logoUrl?: string;
  bannerUrl?: string;
  categories: string[];
  supplierType:
    | 'wholesaler'
    | 'farmer'
    | 'fisherman'
    | 'distributor'
    | 'manufacturer';
  verificationStatus: VerificationStatus;
  minimumOrderSen: number;
  rating: number;
  ratingCount: number;
  joinedAt: ISODateTime;
}

export interface SupplierVerificationDocument {
  id: UUID;
  supplierId: UUID;
  docType: 'ssm_registration' | 'halal_cert' | 'business_license' | 'other';
  fileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: ISODateTime;
  reviewedAt?: ISODateTime;
  reviewNote?: string;
}

export interface Category {
  id: UUID;
  slug: string;
  name: string;
  nameMs: string;
  icon: string;
  parentId?: UUID;
}

export type ProductUnit =
  | 'kg'
  | 'g'
  | 'carton'
  | 'tray'
  | 'packet'
  | 'bottle'
  | 'bag'
  | 'box'
  | 'unit'
  | 'litre';

export interface PriceTier {
  id: UUID;
  productId: UUID;
  minQty: number;
  maxQty?: number;
  pricePerUnitSen: number;
}

export interface ProductImage {
  id: UUID;
  productId: UUID;
  url: string;
  position: number;
  altText?: string;
}

export interface Product {
  id: UUID;
  supplierId: UUID;
  categoryId: UUID;
  name: string;
  nameMs?: string;
  description: string;
  unit: ProductUnit;
  packSize: string;
  basePriceSen: number;
  priceTiers: PriceTier[];
  images: ProductImage[];
  stockQty: number;
  minOrderQty: number;
  prepTimeHours: number;
  isActive: boolean;
  isHalal: boolean;
  createdAt: ISODateTime;
}

export interface Favourite {
  id: UUID;
  buyerId: UUID;
  productId?: UUID;
  supplierId?: UUID;
  createdAt: ISODateTime;
}

export interface CartItem {
  id: UUID;
  productId: UUID;
  supplierId: UUID;
  qty: number;
  unitPriceSen: number;
  notes?: string;
}

export type FulfilmentMethod = 'delivery' | 'pickup';

export type OrderStatus =
  | 'pending_payment'
  | 'payment_submitted'
  | 'awaiting_supplier_confirmation'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export const ORDER_STATUSES: OrderStatus[] = [
  'pending_payment',
  'payment_submitted',
  'awaiting_supplier_confirmation',
  'confirmed',
  'preparing',
  'ready_for_pickup',
  'out_for_delivery',
  'delivered',
  'completed',
  'cancelled',
  'disputed',
];

export type PaymentMethod = 'bank_transfer' | 'cod' | 'cop' | 'fpx';

export interface OrderItem {
  id: UUID;
  orderId: UUID;
  productId: UUID;
  productName: string;
  unit: ProductUnit;
  qty: number;
  unitPriceSen: number;
  lineTotalSen: number;
}

export interface Order {
  id: UUID;
  orderNumber: string;
  buyerId: UUID;
  supplierId: UUID;
  status: OrderStatus;
  fulfilmentMethod: FulfilmentMethod;
  district?: SabahDistrict;
  deliveryAddress?: string;
  paymentMethod: PaymentMethod;
  subtotalSen: number;
  deliveryFeeSen: number;
  totalSen: number;
  items: OrderItem[];
  placedAt: ISODateTime;
  updatedAt: ISODateTime;
  isReorderOf?: UUID;
  isFromQuotationId?: UUID;
  cancelReason?: string;
}

export interface PaymentReceipt {
  id: UUID;
  orderId: UUID;
  fileUrl: string;
  uploadedAt: ISODateTime;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: UUID;
  reviewNote?: string;
}

export interface Payment {
  id: UUID;
  orderId: UUID;
  method: PaymentMethod;
  amountSen: number;
  status: 'unpaid' | 'awaiting_review' | 'paid' | 'failed' | 'refunded';
  provider: 'manual' | 'fpx';
  reference?: string;
  createdAt: ISODateTime;
}

export type QuotationStatus =
  | 'requested'
  | 'quoted'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'converted';

export interface QuotationItem {
  id: UUID;
  quotationId: UUID;
  productId?: UUID;
  description: string;
  qty: number;
  unit: ProductUnit;
  proposedPriceSen?: number;
}

export interface Quotation {
  id: UUID;
  quotationNumber: string;
  buyerId: UUID;
  supplierId: UUID;
  status: QuotationStatus;
  items: QuotationItem[];
  message?: string;
  supplierResponse?: string;
  validUntil?: ISODateTime;
  totalSen?: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  convertedOrderId?: UUID;
}

export interface MessageThread {
  id: UUID;
  buyerId: UUID;
  supplierId: UUID;
  lastMessageAt: ISODateTime;
  lastMessagePreview: string;
}

export interface Message {
  id: UUID;
  threadId: UUID;
  senderId: UUID;
  senderRole: UserRole;
  body: string;
  createdAt: ISODateTime;
  readAt?: ISODateTime;
}

export type NotificationType =
  | 'order_status'
  | 'quotation'
  | 'message'
  | 'verification'
  | 'system';

export interface Notification {
  id: UUID;
  userId: UUID;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  readAt?: ISODateTime;
  createdAt: ISODateTime;
}

export interface Review {
  id: UUID;
  orderId: UUID;
  buyerId: UUID;
  supplierId: UUID;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  createdAt: ISODateTime;
}

export type DisputeStatus = 'open' | 'investigating' | 'resolved' | 'rejected';

export interface Dispute {
  id: UUID;
  orderId: UUID;
  raisedByUserId: UUID;
  reason: string;
  status: DisputeStatus;
  resolutionNote?: string;
  createdAt: ISODateTime;
  resolvedAt?: ISODateTime;
}

export interface PlatformSettings {
  commissionPercent: number;
  demoMode: boolean;
  supportedDistricts: SabahDistrict[];
}

export interface AuditLogEntry {
  id: UUID;
  actorUserId: UUID;
  actorRole: UserRole;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
  createdAt: ISODateTime;
}
