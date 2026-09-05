import 'server-only';
import { getState, nextId, nowIso } from './demo-store';
import type { AppUser, SabahDistrict, UserRole } from '../domain/types';

/**
 * NOTE ON LIVE MODE: the functions below implement demo-mode account
 * creation against the in-memory store so the full signup -> dashboard flow
 * is clickable with zero setup. Wiring the live (Supabase) path means:
 *   1. `supabase.auth.signUp({ email, password })` (or signInWithPassword
 *      for login) inside a Route Handler / Server Action.
 *   2. On success, insert matching rows into `public.users`,
 *      `public.business_profiles`, and `public.buyer_profiles` /
 *      `public.supplier_profiles` using the same shape as here.
 *   3. Supabase's email-confirmation flow (or a magic link) replaces the
 *      "any password" shortcut demo mode uses.
 * The API routes in src/app/api/auth/* already branch on isDemoMode() and
 * call these functions only for the demo path — see login/signup route
 * handlers for where the live-mode Supabase calls would slot in.
 */

export interface DemoLoginResult {
  ok: boolean;
  userId?: string;
  role?: UserRole;
  error?: string;
}

/**
 * Demo-mode "login": matches by email only (any non-empty password is
 * accepted). This is a local-first MVP convenience, NOT real authentication
 * — see README for how live mode uses Supabase Auth (email+password,
 * hashed, sessions via secure cookies) instead.
 */
export async function demoLogin(email: string, password: string): Promise<DemoLoginResult> {
  if (!password) return { ok: false, error: 'Password is required.' };
  const state = getState();
  const user = state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { ok: false, error: 'No account found with that email. Try one of the demo logins on the login page.' };
  if (user.suspended) return { ok: false, error: 'This account has been suspended. Contact TapTap support.' };
  return { ok: true, userId: user.id, role: user.role };
}

export interface SignupBuyerInput {
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  registrationNumber: string;
  address: string;
  district: SabahDistrict;
  postcode?: string;
  businessType: 'restaurant' | 'cafe' | 'bakery' | 'catering' | 'food_stall' | 'hotel' | 'other';
}

export async function signupBuyer(input: SignupBuyerInput): Promise<{ userId: string }> {
  const state = getState();
  if (state.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error('An account with this email already exists.');
  }
  const userId = nextId('user');
  const bizId = nextId('biz');
  const buyerId = nextId('buyer');

  const user: AppUser = { id: userId, email: input.email, fullName: input.fullName, phone: input.phone, role: 'buyer', locale: 'en', createdAt: nowIso() };
  state.users.push(user);
  state.businessProfiles.push({
    id: bizId,
    ownerUserId: userId,
    businessName: input.businessName,
    registrationNumber: input.registrationNumber,
    address: input.address,
    district: input.district,
    postcode: input.postcode,
    phone: input.phone,
    createdAt: nowIso(),
  });
  state.buyerProfiles.push({ id: buyerId, userId, businessProfileId: bizId, businessType: input.businessType });

  return { userId };
}

export interface SignupSupplierInput {
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  registrationNumber: string;
  address: string;
  district: SabahDistrict;
  postcode?: string;
  storeName: string;
  storeDescription: string;
  supplierType: 'wholesaler' | 'farmer' | 'fisherman' | 'distributor' | 'manufacturer';
  categories: string[];
  minimumOrderSen: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function signupSupplier(input: SignupSupplierInput): Promise<{ userId: string; supplierId: string }> {
  const state = getState();
  if (state.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error('An account with this email already exists.');
  }
  const userId = nextId('user');
  const bizId = nextId('biz');
  const supplierId = nextId('sup');
  let slug = slugify(input.storeName);
  if (state.supplierProfiles.some((s) => s.storeSlug === slug)) slug = `${slug}-${state.seq}`;

  const user: AppUser = { id: userId, email: input.email, fullName: input.fullName, phone: input.phone, role: 'supplier', locale: 'en', createdAt: nowIso() };
  state.users.push(user);
  state.businessProfiles.push({
    id: bizId,
    ownerUserId: userId,
    businessName: input.businessName,
    registrationNumber: input.registrationNumber,
    address: input.address,
    district: input.district,
    postcode: input.postcode,
    phone: input.phone,
    createdAt: nowIso(),
  });
  state.supplierProfiles.push({
    id: supplierId,
    userId,
    businessProfileId: bizId,
    storeSlug: slug,
    storeName: input.storeName,
    storeDescription: input.storeDescription,
    categories: input.categories,
    supplierType: input.supplierType,
    verificationStatus: 'pending',
    minimumOrderSen: input.minimumOrderSen,
    rating: 0,
    ratingCount: 0,
    joinedAt: nowIso(),
  });

  // Notify admins a new supplier needs review
  const admins = state.users.filter((u) => u.role === 'admin');
  for (const admin of admins) {
    state.notifications.unshift({
      id: nextId('notif'),
      userId: admin.id,
      type: 'verification',
      title: 'New supplier awaiting review',
      body: `${input.storeName} submitted an application and is awaiting verification.`,
      href: '/admin/verification',
      createdAt: nowIso(),
    });
  }

  return { userId, supplierId };
}
