-- TapTap MVP — initial schema
-- Monetary values are stored as BIGINT "sen" (1 RM = 100 sen) to avoid
-- floating-point rounding errors. Never store money as `numeric`/`float` cents-as-decimal.

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ============================================================================
-- ENUMS
-- ============================================================================

create type user_role as enum ('buyer', 'supplier', 'admin');

create type sabah_district as enum (
  'Tawau', 'Kota Kinabalu', 'Sandakan', 'Lahad Datu', 'Semporna',
  'Kunak', 'Keningau', 'Kota Belud', 'Penampang', 'Putatan'
);

create type verification_status as enum ('unverified', 'pending', 'verified', 'rejected', 'suspended');

create type buyer_business_type as enum (
  'restaurant', 'cafe', 'bakery', 'catering', 'food_stall', 'hotel', 'other'
);

create type supplier_type as enum ('wholesaler', 'farmer', 'fisherman', 'distributor', 'manufacturer');

create type product_unit as enum ('kg', 'g', 'carton', 'tray', 'packet', 'bottle', 'bag', 'box', 'unit', 'litre');

create type fulfilment_method as enum ('delivery', 'pickup');

create type order_status as enum (
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
  'disputed'
);

create type payment_method as enum ('bank_transfer', 'cod', 'cop', 'fpx');
create type payment_status as enum ('unpaid', 'awaiting_review', 'paid', 'failed', 'refunded');
create type payment_provider as enum ('manual', 'fpx');
create type receipt_status as enum ('pending', 'approved', 'rejected');

create type quotation_status as enum ('requested', 'quoted', 'accepted', 'declined', 'expired', 'converted');

create type notification_type as enum ('order_status', 'quotation', 'message', 'verification', 'system');

create type dispute_status as enum ('open', 'investigating', 'resolved', 'rejected');

create type verification_doc_type as enum ('ssm_registration', 'halal_cert', 'business_license', 'other');

-- ============================================================================
-- USERS & BUSINESS PROFILES
-- ============================================================================

-- Mirrors auth.users (Supabase Auth). One row per authenticated user.
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  phone text,
  full_name text not null,
  role user_role not null,
  locale text not null default 'en' check (locale in ('en', 'ms')),
  avatar_url text,
  suspended boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.users (id) on delete cascade,
  business_name text not null,
  registration_number text not null,
  address text not null,
  district sabah_district not null,
  postcode text,
  phone text not null,
  created_at timestamptz not null default now()
);
create index business_profiles_owner_idx on public.business_profiles (owner_user_id);

create table public.buyer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  business_profile_id uuid not null references public.business_profiles (id) on delete cascade,
  business_type buyer_business_type not null default 'restaurant',
  created_at timestamptz not null default now()
);

create table public.supplier_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  business_profile_id uuid not null references public.business_profiles (id) on delete cascade,
  store_slug text not null unique,
  store_name text not null,
  store_description text not null default '',
  logo_url text,
  banner_url text,
  categories text[] not null default '{}',
  supplier_type supplier_type not null default 'wholesaler',
  verification_status verification_status not null default 'pending',
  minimum_order_sen bigint not null default 0 check (minimum_order_sen >= 0),
  rating numeric(2, 1) not null default 0,
  rating_count integer not null default 0,
  joined_at timestamptz not null default now()
);
create index supplier_profiles_verification_idx on public.supplier_profiles (verification_status);
create index supplier_profiles_slug_idx on public.supplier_profiles (store_slug);

create table public.supplier_verification_documents (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.supplier_profiles (id) on delete cascade,
  doc_type verification_doc_type not null,
  file_url text not null,
  status receipt_status not null default 'pending',
  uploaded_at timestamptz not null default now(),
  reviewed_at timestamptz,
  review_note text
);
create index supplier_verification_docs_supplier_idx on public.supplier_verification_documents (supplier_id);

create table public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.supplier_profiles (id) on delete cascade,
  district sabah_district not null,
  delivery_fee_sen bigint not null default 0 check (delivery_fee_sen >= 0),
  free_delivery_threshold_sen bigint check (free_delivery_threshold_sen >= 0),
  eta_hours_min integer not null default 2,
  eta_hours_max integer not null default 24,
  unique (supplier_id, district)
);

-- ============================================================================
-- CATALOGUE
-- ============================================================================

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  name_ms text not null,
  icon text not null default 'package',
  parent_id uuid references public.categories (id)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.supplier_profiles (id) on delete cascade,
  category_id uuid not null references public.categories (id),
  name text not null,
  name_ms text,
  description text not null default '',
  unit product_unit not null,
  pack_size text not null default '',
  base_price_sen bigint not null check (base_price_sen >= 0),
  stock_qty numeric not null default 0 check (stock_qty >= 0),
  min_order_qty numeric not null default 1 check (min_order_qty > 0),
  prep_time_hours numeric not null default 0,
  is_active boolean not null default true,
  is_halal boolean not null default true,
  created_at timestamptz not null default now()
);
create index products_supplier_idx on public.products (supplier_id);
create index products_category_idx on public.products (category_id);
create index products_active_idx on public.products (is_active);
create index products_name_trgm_idx on public.products using gin (to_tsvector('english', name));

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  position integer not null default 0,
  alt_text text
);
create index product_images_product_idx on public.product_images (product_id);

create table public.product_price_tiers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  min_qty numeric not null check (min_qty > 0),
  max_qty numeric check (max_qty is null or max_qty >= min_qty),
  price_per_unit_sen bigint not null check (price_per_unit_sen >= 0)
);
create index product_price_tiers_product_idx on public.product_price_tiers (product_id);

-- Simple current-stock ledger; product.stock_qty is the fast-path read,
-- this table records the history of changes for audit/debugging.
create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  change_qty numeric not null,
  reason text not null,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- FAVOURITES / CART
-- ============================================================================

create table public.favourites (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.buyer_profiles (id) on delete cascade,
  product_id uuid references public.products (id) on delete cascade,
  supplier_id uuid references public.supplier_profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favourites_target_check check (
    (product_id is not null and supplier_id is null) or (product_id is null and supplier_id is not null)
  ),
  unique (buyer_id, product_id),
  unique (buyer_id, supplier_id)
);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null unique references public.buyer_profiles (id) on delete cascade,
  updated_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  supplier_id uuid not null references public.supplier_profiles (id) on delete cascade,
  qty numeric not null check (qty > 0),
  unit_price_sen bigint not null check (unit_price_sen >= 0),
  notes text,
  created_at timestamptz not null default now(),
  unique (cart_id, product_id)
);
create index cart_items_cart_idx on public.cart_items (cart_id);

-- ============================================================================
-- ORDERS
-- ============================================================================

create sequence public.order_number_seq;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('TT-' || to_char(now(), 'YYYYMM') || '-' || lpad(nextval('public.order_number_seq')::text, 5, '0')),
  buyer_id uuid not null references public.buyer_profiles (id),
  supplier_id uuid not null references public.supplier_profiles (id),
  status order_status not null default 'pending_payment',
  fulfilment_method fulfilment_method not null,
  district sabah_district,
  delivery_address text,
  payment_method payment_method not null,
  subtotal_sen bigint not null check (subtotal_sen >= 0),
  delivery_fee_sen bigint not null default 0 check (delivery_fee_sen >= 0),
  total_sen bigint not null check (total_sen >= 0),
  is_reorder_of uuid references public.orders (id),
  is_from_quotation_id uuid,
  cancel_reason text,
  placed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_buyer_idx on public.orders (buyer_id);
create index orders_supplier_idx on public.orders (supplier_id);
create index orders_status_idx on public.orders (status);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id),
  product_name text not null,
  unit product_unit not null,
  qty numeric not null check (qty > 0),
  unit_price_sen bigint not null check (unit_price_sen >= 0),
  line_total_sen bigint not null check (line_total_sen >= 0)
);
create index order_items_order_idx on public.order_items (order_id);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  from_status order_status,
  to_status order_status not null,
  changed_by uuid references public.users (id),
  note text,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  method payment_method not null,
  amount_sen bigint not null check (amount_sen >= 0),
  status payment_status not null default 'unpaid',
  provider payment_provider not null default 'manual',
  reference text,
  created_at timestamptz not null default now()
);
create index payments_order_idx on public.payments (order_id);

create table public.payment_receipts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  file_url text not null,
  status receipt_status not null default 'pending',
  uploaded_at timestamptz not null default now(),
  reviewed_by uuid references public.users (id),
  review_note text
);
create index payment_receipts_order_idx on public.payment_receipts (order_id);

-- ============================================================================
-- QUOTATIONS (RFQ)
-- ============================================================================

create sequence public.quotation_number_seq;

create table public.quotation_requests (
  id uuid primary key default gen_random_uuid(),
  quotation_number text not null unique default ('RFQ-' || to_char(now(), 'YYYYMM') || '-' || lpad(nextval('public.quotation_number_seq')::text, 5, '0')),
  buyer_id uuid not null references public.buyer_profiles (id),
  supplier_id uuid not null references public.supplier_profiles (id),
  status quotation_status not null default 'requested',
  message text,
  supplier_response text,
  valid_until timestamptz,
  total_sen bigint,
  converted_order_id uuid references public.orders (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index quotation_requests_buyer_idx on public.quotation_requests (buyer_id);
create index quotation_requests_supplier_idx on public.quotation_requests (supplier_id);

create table public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotation_requests (id) on delete cascade,
  product_id uuid references public.products (id),
  description text not null,
  qty numeric not null check (qty > 0),
  unit product_unit not null,
  proposed_price_sen bigint
);
create index quotation_items_quotation_idx on public.quotation_items (quotation_id);

alter table public.orders
  add constraint orders_quotation_fk foreign key (is_from_quotation_id) references public.quotation_requests (id);

-- ============================================================================
-- MESSAGING / NOTIFICATIONS
-- ============================================================================

create table public.message_threads (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.buyer_profiles (id) on delete cascade,
  supplier_id uuid not null references public.supplier_profiles (id) on delete cascade,
  last_message_at timestamptz not null default now(),
  last_message_preview text not null default '',
  unique (buyer_id, supplier_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.message_threads (id) on delete cascade,
  sender_id uuid not null references public.users (id),
  sender_role user_role not null,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index messages_thread_idx on public.messages (thread_id);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text not null,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, read_at);

-- ============================================================================
-- REVIEWS / DISPUTES / PLATFORM
-- ============================================================================

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete cascade,
  buyer_id uuid not null references public.buyer_profiles (id),
  supplier_id uuid not null references public.supplier_profiles (id),
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);
create index reviews_supplier_idx on public.reviews (supplier_id);

create table public.disputes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  raised_by_user_id uuid not null references public.users (id),
  reason text not null,
  status dispute_status not null default 'open',
  resolution_note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index disputes_order_idx on public.disputes (order_id);

create table public.platform_settings (
  id boolean primary key default true check (id), -- singleton row
  commission_percent numeric(5, 2) not null default 8.00,
  demo_mode boolean not null default true,
  supported_districts sabah_district[] not null default array[
    'Tawau', 'Kota Kinabalu', 'Sandakan', 'Lahad Datu', 'Semporna',
    'Kunak', 'Keningau', 'Kota Belud', 'Penampang', 'Putatan'
  ]::sabah_district[]
);
insert into public.platform_settings (id) values (true);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.users (id),
  actor_role user_role,
  action text not null,
  target_type text not null,
  target_id text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_target_idx on public.audit_logs (target_type, target_id);
create index audit_logs_actor_idx on public.audit_logs (actor_user_id);

-- ============================================================================
-- updated_at triggers
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger orders_set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create trigger quotation_requests_set_updated_at before update on public.quotation_requests
  for each row execute function public.set_updated_at();

create trigger carts_set_updated_at before update on public.carts
  for each row execute function public.set_updated_at();
