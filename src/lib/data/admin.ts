import 'server-only';
import { isDemoMode } from '../supabase/env';
import { getState, nextId, nowIso } from './demo-store';
import type {
  AppUser,
  AuditLogEntry,
  Dispute,
  DisputeStatus,
  Order,
  PaymentReceipt,
  Product,
  SupplierProfile,
  VerificationStatus,
} from '../domain/types';

export async function getAllProducts(): Promise<Product[]> {
  if (isDemoMode()) return getState().products;
  const { createClient } = await import('../supabase/server');
  const { mapDbProduct } = await import('./catalogue');
  const supabase = await createClient();
  const { data } = await supabase.from('products').select('*, product_images(*), product_price_tiers(*)');
  return (data ?? []).map(mapDbProduct);
}

export async function getPendingSuppliers(): Promise<SupplierProfile[]> {
  if (isDemoMode()) {
    return getState().supplierProfiles.filter((s) => s.verificationStatus === 'pending');
  }
  const { createClient } = await import('../supabase/server');
  const { mapDbSupplier } = await import('./catalogue');
  const supabase = await createClient();
  const { data } = await supabase.from('supplier_profiles').select('*').eq('verification_status', 'pending');
  return (data ?? []).map(mapDbSupplier);
}

export async function getAllSuppliers(): Promise<SupplierProfile[]> {
  if (isDemoMode()) return getState().supplierProfiles;
  const { createClient } = await import('../supabase/server');
  const { mapDbSupplier } = await import('./catalogue');
  const supabase = await createClient();
  const { data } = await supabase.from('supplier_profiles').select('*');
  return (data ?? []).map(mapDbSupplier);
}

export async function setSupplierVerification(
  supplierId: string,
  status: VerificationStatus,
  adminUserId: string,
  note?: string,
): Promise<void> {
  if (isDemoMode()) {
    const state = getState();
    const supplier = state.supplierProfiles.find((s) => s.id === supplierId);
    if (!supplier) throw new Error('Supplier not found');
    supplier.verificationStatus = status;

    state.auditLogs.unshift({
      id: nextId('audit'),
      actorUserId: adminUserId,
      actorRole: 'admin',
      action: 'supplier.verification_changed',
      targetType: 'supplier_profile',
      targetId: supplierId,
      metadata: { status, note },
      createdAt: nowIso(),
    });

    state.notifications.unshift({
      id: nextId('notif'),
      userId: supplier.userId,
      type: 'verification',
      title: status === 'verified' ? 'You are verified!' : `Verification ${status}`,
      body:
        status === 'verified'
          ? 'Your storefront is now live on TapTap.'
          : `Your supplier verification status is now "${status}".${note ? ` Note: ${note}` : ''}`,
      href: '/supplier/verification',
      createdAt: nowIso(),
    });
    return;
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  await supabase.from('supplier_profiles').update({ verification_status: status }).eq('id', supplierId);
  await supabase.from('audit_logs').insert({
    actor_user_id: adminUserId,
    actor_role: 'admin',
    action: 'supplier.verification_changed',
    target_type: 'supplier_profile',
    target_id: supplierId,
    metadata: { status, note },
  });
}

export async function getAllUsers(): Promise<AppUser[]> {
  if (isDemoMode()) return getState().users;
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('users').select('*');
  return (data ?? []).map((u) => ({
    id: u.id,
    email: u.email,
    phone: u.phone ?? undefined,
    fullName: u.full_name,
    role: u.role,
    locale: u.locale,
    avatarUrl: u.avatar_url ?? undefined,
    createdAt: u.created_at,
    suspended: u.suspended,
  }));
}

export async function setUserSuspended(userId: string, suspended: boolean, adminUserId: string): Promise<void> {
  if (isDemoMode()) {
    const state = getState();
    const user = state.users.find((u) => u.id === userId);
    if (user) user.suspended = suspended;
    state.auditLogs.unshift({
      id: nextId('audit'),
      actorUserId: adminUserId,
      actorRole: 'admin',
      action: suspended ? 'user.suspended' : 'user.reinstated',
      targetType: 'user',
      targetId: userId,
      createdAt: nowIso(),
    });
    return;
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  await supabase.from('users').update({ suspended }).eq('id', userId);
  await supabase.from('audit_logs').insert({
    actor_user_id: adminUserId,
    actor_role: 'admin',
    action: suspended ? 'user.suspended' : 'user.reinstated',
    target_type: 'user',
    target_id: userId,
  });
}

export async function getAllOrders(): Promise<Order[]> {
  if (isDemoMode()) {
    return getState().orders;
  }
  const { createClient } = await import('../supabase/server');
  const { mapDbOrder } = await import('./orders');
  const supabase = await createClient();
  const { data } = await supabase.from('orders').select('*, order_items(*)').order('placed_at', { ascending: false });
  return (data ?? []).map(mapDbOrder);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbReceipt(row: any): PaymentReceipt {
  return {
    id: row.id,
    orderId: row.order_id,
    fileUrl: row.file_url,
    uploadedAt: row.uploaded_at,
    status: row.status,
    reviewedBy: row.reviewed_by ?? undefined,
    reviewNote: row.review_note ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbDispute(row: any): Dispute {
  return {
    id: row.id,
    orderId: row.order_id,
    raisedByUserId: row.raised_by_user_id,
    reason: row.reason,
    status: row.status,
    resolutionNote: row.resolution_note ?? undefined,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at ?? undefined,
  };
}

export async function getPendingReceipts(): Promise<PaymentReceipt[]> {
  if (isDemoMode()) return []; // demo mode: receipts are simulated as instantly "uploaded" without a queue
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('payment_receipts').select('*').eq('status', 'pending');
  return (data ?? []).map(mapDbReceipt);
}

export async function getDisputes(): Promise<Dispute[]> {
  if (isDemoMode()) return getState().disputes;
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('disputes').select('*');
  return (data ?? []).map(mapDbDispute);
}

export async function resolveDispute(disputeId: string, status: DisputeStatus, resolutionNote: string, adminUserId: string): Promise<void> {
  if (isDemoMode()) {
    const state = getState();
    const dispute = state.disputes.find((d) => d.id === disputeId);
    if (dispute) {
      dispute.status = status;
      dispute.resolutionNote = resolutionNote;
      dispute.resolvedAt = status === 'resolved' || status === 'rejected' ? nowIso() : undefined;
    }
    state.auditLogs.unshift({
      id: nextId('audit'),
      actorUserId: adminUserId,
      actorRole: 'admin',
      action: 'dispute.resolved',
      targetType: 'dispute',
      targetId: disputeId,
      metadata: { status, resolutionNote },
      createdAt: nowIso(),
    });
    return;
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  await supabase.from('disputes').update({ status, resolution_note: resolutionNote, resolved_at: new Date().toISOString() }).eq('id', disputeId);
}

export async function getCommissionPercent(): Promise<number> {
  if (isDemoMode()) return getState().commissionPercent;
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('platform_settings').select('commission_percent').single();
  return data ? Number(data.commission_percent) : 8;
}

export async function setCommissionPercent(percent: number, adminUserId: string): Promise<void> {
  if (isDemoMode()) {
    const state = getState();
    state.commissionPercent = percent;
    state.auditLogs.unshift({
      id: nextId('audit'),
      actorUserId: adminUserId,
      actorRole: 'admin',
      action: 'platform_settings.updated',
      targetType: 'platform_settings',
      targetId: 'singleton',
      metadata: { commissionPercent: percent },
      createdAt: nowIso(),
    });
    return;
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  await supabase.from('platform_settings').update({ commission_percent: percent }).eq('id', true);
}

export async function getAuditLog(limit = 100): Promise<AuditLogEntry[]> {
  if (isDemoMode()) return getState().auditLogs.slice(0, limit);
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(limit);
  return (data ?? []).map((a) => ({
    id: a.id,
    actorUserId: a.actor_user_id,
    actorRole: a.actor_role,
    action: a.action,
    targetType: a.target_type,
    targetId: a.target_id,
    metadata: a.metadata ?? undefined,
    createdAt: a.created_at,
  }));
}

export interface MarketplaceStats {
  totalBuyers: number;
  totalSuppliers: number;
  verifiedSuppliers: number;
  pendingVerifications: number;
  totalProducts: number;
  totalOrders: number;
  gmvSen: number;
  openDisputes: number;
}

export async function getMarketplaceStats(): Promise<MarketplaceStats> {
  if (isDemoMode()) {
    const state = getState();
    return {
      totalBuyers: state.buyerProfiles.length,
      totalSuppliers: state.supplierProfiles.length,
      verifiedSuppliers: state.supplierProfiles.filter((s) => s.verificationStatus === 'verified').length,
      pendingVerifications: state.supplierProfiles.filter((s) => s.verificationStatus === 'pending').length,
      totalProducts: state.products.length,
      totalOrders: state.orders.length,
      gmvSen: state.orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.totalSen, 0),
      openDisputes: state.disputes.filter((d) => d.status === 'open' || d.status === 'investigating').length,
    };
  }
  const { createClient } = await import('../supabase/server');
  const supabase = await createClient();
  const [{ count: buyers }, { count: suppliers }, { count: verified }, { count: pending }, { count: products }, { data: orders }, { count: disputes }] =
    await Promise.all([
      supabase.from('buyer_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('supplier_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('supplier_profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified'),
      supabase.from('supplier_profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('total_sen, status'),
      supabase.from('disputes').select('*', { count: 'exact', head: true }).in('status', ['open', 'investigating']),
    ]);
  return {
    totalBuyers: buyers ?? 0,
    totalSuppliers: suppliers ?? 0,
    verifiedSuppliers: verified ?? 0,
    pendingVerifications: pending ?? 0,
    totalProducts: products ?? 0,
    totalOrders: orders?.length ?? 0,
    gmvSen: (orders ?? []).filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.total_sen, 0),
    openDisputes: disputes ?? 0,
  };
}
