/**
 * In-memory "demo mode" datastore. Seeded once per server process from
 * seed-data.ts and mutated as buyers/suppliers/admins interact with the app.
 *
 * This intentionally is NOT a database: state resets whenever the dev server
 * restarts, and does not survive multiple server instances (e.g. serverless).
 * It exists so the full TapTap MVP is genuinely clickable/functional with
 * zero external setup. For real persistence, configure Supabase — see
 * README.md and src/lib/supabase.
 */
import * as seed from './seed-data';
import type {
  AppUser,
  BuyerProfile,
  BusinessProfile,
  CartItem,
  Dispute,
  Favourite,
  Message,
  MessageThread,
  Notification,
  Order,
  Product,
  Quotation,
  Review,
  SupplierProfile,
  SupplierVerificationDocument,
  AuditLogEntry,
  DeliveryZone,
} from '../domain/types';

interface DemoState {
  users: AppUser[];
  businessProfiles: BusinessProfile[];
  buyerProfiles: BuyerProfile[];
  supplierProfiles: SupplierProfile[];
  supplierVerificationDocuments: SupplierVerificationDocument[];
  deliveryZones: DeliveryZone[];
  products: Product[];
  favourites: Favourite[];
  cartItems: CartItem[]; // buyerId is not on CartItem directly; keyed via cartsByBuyer
  cartsByBuyer: Record<string, string[]>; // buyerId -> cartItem ids
  orders: Order[];
  quotations: Quotation[];
  messageThreads: MessageThread[];
  messages: Message[];
  notifications: Notification[];
  reviews: Review[];
  disputes: Dispute[];
  auditLogs: AuditLogEntry[];
  commissionPercent: number;
  seq: number;
}

function cloneSeed(): DemoState {
  return {
    users: structuredClone(seed.users),
    businessProfiles: structuredClone(seed.businessProfiles),
    buyerProfiles: structuredClone(seed.buyerProfiles),
    supplierProfiles: structuredClone(seed.supplierProfiles),
    supplierVerificationDocuments: structuredClone(seed.supplierVerificationDocuments),
    deliveryZones: structuredClone(seed.deliveryZones),
    products: structuredClone(seed.products),
    favourites: [],
    cartItems: [],
    cartsByBuyer: {},
    orders: structuredClone(seed.orders),
    quotations: structuredClone(seed.quotations),
    messageThreads: structuredClone(seed.messageThreads),
    messages: structuredClone(seed.messages),
    notifications: structuredClone(seed.notifications),
    reviews: structuredClone(seed.reviews),
    disputes: [],
    auditLogs: [
      {
        id: 'audit-1',
        actorUserId: 'user-admin-1',
        actorRole: 'admin',
        action: 'supplier.verified',
        targetType: 'supplier_profile',
        targetId: 'sup-1',
        metadata: { note: 'SSM registration and site visit confirmed.' },
        createdAt: '2025-11-02T04:00:00Z',
      },
      {
        id: 'audit-2',
        actorUserId: 'user-admin-1',
        actorRole: 'admin',
        action: 'platform_settings.updated',
        targetType: 'platform_settings',
        targetId: 'singleton',
        metadata: { commissionPercent: 8 },
        createdAt: '2025-10-02T04:00:00Z',
      },
    ],
    commissionPercent: 8,
    seq: 1000,
  };
}

// A module-level singleton. In Next.js dev mode this is preserved via
// globalThis so hot-reloads don't wipe demo data mid-session.
const globalForDemo = globalThis as unknown as { __taptapDemoState?: DemoState };

export function getState(): DemoState {
  if (!globalForDemo.__taptapDemoState) {
    globalForDemo.__taptapDemoState = cloneSeed();
  }
  return globalForDemo.__taptapDemoState;
}

export function resetDemoState(): void {
  globalForDemo.__taptapDemoState = cloneSeed();
}

export function nextId(prefix: string): string {
  const state = getState();
  state.seq += 1;
  return `${prefix}-${state.seq}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
