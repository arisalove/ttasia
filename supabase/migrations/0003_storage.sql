-- Storage buckets for product images, verification documents and payment receipts.
insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('verification-docs', 'verification-docs', false),
  ('payment-receipts', 'payment-receipts', false)
on conflict (id) do nothing;

-- Product images: publicly readable, only the owning supplier can upload.
create policy "Product images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Suppliers can upload their own product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Verification docs & receipts: private, readable by uploader + admin only.
create policy "Owners can read their verification docs"
  on storage.objects for select
  using (
    bucket_id = 'verification-docs'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

create policy "Owners can upload their verification docs"
  on storage.objects for insert
  with check (bucket_id = 'verification-docs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owners can read their payment receipts"
  on storage.objects for select
  using (
    bucket_id = 'payment-receipts'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

create policy "Buyers can upload their payment receipts"
  on storage.objects for insert
  with check (bucket_id = 'payment-receipts' and (storage.foldername(name))[1] = auth.uid()::text);
