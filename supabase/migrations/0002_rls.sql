-- Row Level Security policies.
-- Convention: every table is locked down by default; policies grant the
-- narrowest access each role needs. `public.users.role` drives role checks.
-- Admins bypass most restrictions via `public.is_admin()`.

create or replace function public.current_role_is(target user_role)
returns boolean as $$
  select exists (
    select 1 from public.users u where u.id = auth.uid() and u.role = target
  );
$$ language sql stable security definer;

create or replace function public.is_admin()
returns boolean as $$
  select public.current_role_is('admin');
$$ language sql stable security definer;

create or replace function public.owns_buyer_profile(target_buyer_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.buyer_profiles bp where bp.id = target_buyer_id and bp.user_id = auth.uid()
  );
$$ language sql stable security definer;

create or replace function public.owns_supplier_profile(target_supplier_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.supplier_profiles sp where sp.id = target_supplier_id and sp.user_id = auth.uid()
  );
$$ language sql stable security definer;

alter table public.users enable row level security;
alter table public.business_profiles enable row level security;
alter table public.buyer_profiles enable row level security;
alter table public.supplier_profiles enable row level security;
alter table public.supplier_verification_documents enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_price_tiers enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.favourites enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.payments enable row level security;
alter table public.payment_receipts enable row level security;
alter table public.quotation_requests enable row level security;
alter table public.quotation_items enable row level security;
alter table public.message_threads enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.reviews enable row level security;
alter table public.disputes enable row level security;
alter table public.platform_settings enable row level security;
alter table public.audit_logs enable row level security;

-- ---- users ----
create policy users_select_self on public.users for select using (id = auth.uid() or public.is_admin());
create policy users_update_self on public.users for update using (id = auth.uid() or public.is_admin());
create policy users_insert_self on public.users for insert with check (id = auth.uid());

-- ---- business / buyer / supplier profiles ----
create policy business_profiles_owner on public.business_profiles for all
  using (owner_user_id = auth.uid() or public.is_admin())
  with check (owner_user_id = auth.uid() or public.is_admin());

create policy buyer_profiles_owner on public.buyer_profiles for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- Anyone (including anonymous) can read verified supplier storefronts;
-- suppliers manage their own profile; admins manage all.
create policy supplier_profiles_public_read on public.supplier_profiles for select
  using (verification_status = 'verified' or user_id = auth.uid() or public.is_admin());
create policy supplier_profiles_owner_write on public.supplier_profiles for insert
  with check (user_id = auth.uid());
create policy supplier_profiles_owner_update on public.supplier_profiles for update
  using (user_id = auth.uid() or public.is_admin());

create policy supplier_docs_owner on public.supplier_verification_documents for all
  using (public.owns_supplier_profile(supplier_id) or public.is_admin())
  with check (public.owns_supplier_profile(supplier_id) or public.is_admin());

create policy delivery_zones_public_read on public.delivery_zones for select using (true);
create policy delivery_zones_owner_write on public.delivery_zones for insert with check (public.owns_supplier_profile(supplier_id));
create policy delivery_zones_owner_update on public.delivery_zones for update using (public.owns_supplier_profile(supplier_id) or public.is_admin());
create policy delivery_zones_owner_delete on public.delivery_zones for delete using (public.owns_supplier_profile(supplier_id) or public.is_admin());

-- ---- catalogue: public read, supplier-owned write ----
create policy categories_public_read on public.categories for select using (true);
create policy categories_admin_write on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy products_public_read on public.products for select using (is_active or public.owns_supplier_profile(supplier_id) or public.is_admin());
create policy products_owner_write on public.products for insert with check (public.owns_supplier_profile(supplier_id));
create policy products_owner_update on public.products for update using (public.owns_supplier_profile(supplier_id) or public.is_admin());
create policy products_owner_delete on public.products for delete using (public.owns_supplier_profile(supplier_id) or public.is_admin());

create policy product_images_public_read on public.product_images for select using (true);
create policy product_images_owner_write on public.product_images for all
  using (exists (select 1 from public.products p where p.id = product_id and public.owns_supplier_profile(p.supplier_id)) or public.is_admin())
  with check (exists (select 1 from public.products p where p.id = product_id and public.owns_supplier_profile(p.supplier_id)) or public.is_admin());

create policy product_price_tiers_public_read on public.product_price_tiers for select using (true);
create policy product_price_tiers_owner_write on public.product_price_tiers for all
  using (exists (select 1 from public.products p where p.id = product_id and public.owns_supplier_profile(p.supplier_id)) or public.is_admin())
  with check (exists (select 1 from public.products p where p.id = product_id and public.owns_supplier_profile(p.supplier_id)) or public.is_admin());

create policy inventory_movements_owner on public.inventory_movements for all
  using (exists (select 1 from public.products p where p.id = product_id and public.owns_supplier_profile(p.supplier_id)) or public.is_admin())
  with check (exists (select 1 from public.products p where p.id = product_id and public.owns_supplier_profile(p.supplier_id)) or public.is_admin());

-- ---- favourites / cart: buyer-owned only ----
create policy favourites_owner on public.favourites for all
  using (public.owns_buyer_profile(buyer_id))
  with check (public.owns_buyer_profile(buyer_id));

create policy carts_owner on public.carts for all
  using (public.owns_buyer_profile(buyer_id))
  with check (public.owns_buyer_profile(buyer_id));

create policy cart_items_owner on public.cart_items for all
  using (exists (select 1 from public.carts c where c.id = cart_id and public.owns_buyer_profile(c.buyer_id)))
  with check (exists (select 1 from public.carts c where c.id = cart_id and public.owns_buyer_profile(c.buyer_id)));

-- ---- orders: visible to the buyer and supplier involved, plus admin ----
create policy orders_participants on public.orders for select
  using (public.owns_buyer_profile(buyer_id) or public.owns_supplier_profile(supplier_id) or public.is_admin());
create policy orders_buyer_insert on public.orders for insert with check (public.owns_buyer_profile(buyer_id));
create policy orders_participants_update on public.orders for update
  using (public.owns_buyer_profile(buyer_id) or public.owns_supplier_profile(supplier_id) or public.is_admin());

create policy order_items_participants on public.order_items for select
  using (exists (
    select 1 from public.orders o where o.id = order_id
    and (public.owns_buyer_profile(o.buyer_id) or public.owns_supplier_profile(o.supplier_id) or public.is_admin())
  ));
create policy order_items_buyer_insert on public.order_items for insert with check (
  exists (select 1 from public.orders o where o.id = order_id and public.owns_buyer_profile(o.buyer_id))
);

create policy order_status_history_participants on public.order_status_history for select
  using (exists (
    select 1 from public.orders o where o.id = order_id
    and (public.owns_buyer_profile(o.buyer_id) or public.owns_supplier_profile(o.supplier_id) or public.is_admin())
  ));
create policy order_status_history_insert on public.order_status_history for insert with check (
  exists (
    select 1 from public.orders o where o.id = order_id
    and (public.owns_buyer_profile(o.buyer_id) or public.owns_supplier_profile(o.supplier_id) or public.is_admin())
  )
);

create policy payments_participants on public.payments for select
  using (exists (
    select 1 from public.orders o where o.id = order_id
    and (public.owns_buyer_profile(o.buyer_id) or public.owns_supplier_profile(o.supplier_id) or public.is_admin())
  ));
create policy payments_buyer_write on public.payments for insert with check (
  exists (select 1 from public.orders o where o.id = order_id and public.owns_buyer_profile(o.buyer_id))
);

create policy payment_receipts_participants on public.payment_receipts for select
  using (exists (
    select 1 from public.orders o where o.id = order_id
    and (public.owns_buyer_profile(o.buyer_id) or public.owns_supplier_profile(o.supplier_id) or public.is_admin())
  ));
create policy payment_receipts_buyer_write on public.payment_receipts for insert with check (
  exists (select 1 from public.orders o where o.id = order_id and public.owns_buyer_profile(o.buyer_id))
);
create policy payment_receipts_review on public.payment_receipts for update
  using (
    exists (select 1 from public.orders o where o.id = order_id and public.owns_supplier_profile(o.supplier_id))
    or public.is_admin()
  );

-- ---- quotations ----
create policy quotation_requests_participants on public.quotation_requests for select
  using (public.owns_buyer_profile(buyer_id) or public.owns_supplier_profile(supplier_id) or public.is_admin());
create policy quotation_requests_buyer_insert on public.quotation_requests for insert with check (public.owns_buyer_profile(buyer_id));
create policy quotation_requests_participants_update on public.quotation_requests for update
  using (public.owns_buyer_profile(buyer_id) or public.owns_supplier_profile(supplier_id) or public.is_admin());

create policy quotation_items_participants on public.quotation_items for select
  using (exists (
    select 1 from public.quotation_requests q where q.id = quotation_id
    and (public.owns_buyer_profile(q.buyer_id) or public.owns_supplier_profile(q.supplier_id) or public.is_admin())
  ));
create policy quotation_items_write on public.quotation_items for all
  using (exists (
    select 1 from public.quotation_requests q where q.id = quotation_id
    and (public.owns_buyer_profile(q.buyer_id) or public.owns_supplier_profile(q.supplier_id) or public.is_admin())
  ))
  with check (exists (
    select 1 from public.quotation_requests q where q.id = quotation_id
    and (public.owns_buyer_profile(q.buyer_id) or public.owns_supplier_profile(q.supplier_id) or public.is_admin())
  ));

-- ---- messaging ----
create policy message_threads_participants on public.message_threads for select
  using (public.owns_buyer_profile(buyer_id) or public.owns_supplier_profile(supplier_id) or public.is_admin());
create policy message_threads_insert on public.message_threads for insert
  with check (public.owns_buyer_profile(buyer_id) or public.owns_supplier_profile(supplier_id));

create policy messages_participants on public.messages for select
  using (exists (
    select 1 from public.message_threads t where t.id = thread_id
    and (public.owns_buyer_profile(t.buyer_id) or public.owns_supplier_profile(t.supplier_id) or public.is_admin())
  ));
create policy messages_insert on public.messages for insert
  with check (sender_id = auth.uid() and exists (
    select 1 from public.message_threads t where t.id = thread_id
    and (public.owns_buyer_profile(t.buyer_id) or public.owns_supplier_profile(t.supplier_id))
  ));

-- ---- notifications: strictly own ----
create policy notifications_owner on public.notifications for select using (user_id = auth.uid() or public.is_admin());
create policy notifications_owner_update on public.notifications for update using (user_id = auth.uid());
create policy notifications_system_insert on public.notifications for insert with check (true);

-- ---- reviews: public read, buyer writes once, only after completion (enforced in app layer + trigger below) ----
create policy reviews_public_read on public.reviews for select using (true);
create policy reviews_buyer_insert on public.reviews for insert with check (public.owns_buyer_profile(buyer_id));

create or replace function public.enforce_review_after_completion()
returns trigger as $$
declare
  order_status_val order_status;
begin
  select status into order_status_val from public.orders where id = new.order_id;
  if order_status_val is distinct from 'completed' then
    raise exception 'Reviews may only be submitted for completed orders';
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger reviews_require_completed_order
  before insert on public.reviews
  for each row execute function public.enforce_review_after_completion();

-- ---- disputes ----
create policy disputes_participants on public.disputes for select
  using (
    exists (
      select 1 from public.orders o where o.id = order_id
      and (public.owns_buyer_profile(o.buyer_id) or public.owns_supplier_profile(o.supplier_id))
    ) or public.is_admin()
  );
create policy disputes_insert on public.disputes for insert with check (raised_by_user_id = auth.uid());
create policy disputes_admin_update on public.disputes for update using (public.is_admin());

-- ---- platform settings / audit log: admin-only ----
create policy platform_settings_admin on public.platform_settings for all using (public.is_admin()) with check (public.is_admin());
create policy platform_settings_public_read on public.platform_settings for select using (true);

create policy audit_logs_admin_read on public.audit_logs for select using (public.is_admin());
create policy audit_logs_insert on public.audit_logs for insert with check (true);
