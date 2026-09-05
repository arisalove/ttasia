/**
 * Populates a real Supabase project with the same fictional TapTap demo data
 * used by "demo mode" (see src/lib/data/seed-data.ts). Run this once against
 * a freshly-migrated project:
 *
 *   npm run seed
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to be set
 * (see .env.example) — this uses the service-role key to bypass RLS and to
 * create real Supabase Auth users for every seed account.
 *
 * This script is intended to run ONCE against an empty project. Re-running it
 * will fail on unique constraints (emails, store slugs, etc). If you need a
 * clean slate, reset your Supabase project's database and re-run migrations
 * first.
 *
 * All seed accounts share the password below — change it after first login
 * in any real deployment.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import * as seed from '../../src/lib/data/seed-data';

const SEED_PASSWORD = 'TapTapDemo123!';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set to run the seed script.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

// Maps from the fictional string ids in seed-data.ts to the real UUIDs
// Postgres assigns on insert, so every foreign key below is rewritten.
const userIds = new Map<string, string>();
const businessProfileIds = new Map<string, string>();
const buyerProfileIds = new Map<string, string>();
const supplierProfileIds = new Map<string, string>();
const categoryIds = new Map<string, string>();
const productIds = new Map<string, string>();
const orderIds = new Map<string, string>();
const quotationIds = new Map<string, string>();
const threadIds = new Map<string, string>();

async function main() {
  console.log('Seeding TapTap demo data into', url);

  // ---- Auth users + public.users ----------------------------------------
  for (const user of seed.users) {
    const { data: created, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: SEED_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: user.fullName },
    });
    if (authError || !created.user) {
      throw new Error(`Failed to create auth user ${user.email}: ${authError?.message}`);
    }
    userIds.set(user.id, created.user.id);

    const { error } = await supabase.from('users').insert({
      id: created.user.id,
      email: user.email,
      phone: user.phone,
      full_name: user.fullName,
      role: user.role,
      locale: user.locale,
      avatar_url: user.avatarUrl,
      suspended: user.suspended ?? false,
    });
    if (error) throw new Error(`users insert failed for ${user.email}: ${error.message}`);
  }
  console.log(`Created ${seed.users.length} users.`);

  // ---- Business profiles --------------------------------------------------
  for (const biz of seed.businessProfiles) {
    const { data, error } = await supabase
      .from('business_profiles')
      .insert({
        owner_user_id: userIds.get(biz.ownerUserId),
        business_name: biz.businessName,
        registration_number: biz.registrationNumber,
        address: biz.address,
        district: biz.district,
        postcode: biz.postcode,
        phone: biz.phone,
      })
      .select('id')
      .single();
    if (error || !data) throw new Error(`business_profiles insert failed for ${biz.businessName}: ${error?.message}`);
    businessProfileIds.set(biz.id, data.id);
  }
  console.log(`Created ${seed.businessProfiles.length} business profiles.`);

  // ---- Buyer profiles -------------------------------------------------------
  for (const buyer of seed.buyerProfiles) {
    const { data, error } = await supabase
      .from('buyer_profiles')
      .insert({
        user_id: userIds.get(buyer.userId),
        business_profile_id: businessProfileIds.get(buyer.businessProfileId),
        business_type: buyer.businessType,
      })
      .select('id')
      .single();
    if (error || !data) throw new Error(`buyer_profiles insert failed: ${error?.message}`);
    buyerProfileIds.set(buyer.id, data.id);
  }
  console.log(`Created ${seed.buyerProfiles.length} buyer profiles.`);

  // ---- Supplier profiles ------------------------------------------------
  for (const supplier of seed.supplierProfiles) {
    const { data, error } = await supabase
      .from('supplier_profiles')
      .insert({
        user_id: userIds.get(supplier.userId),
        business_profile_id: businessProfileIds.get(supplier.businessProfileId),
        store_slug: supplier.storeSlug,
        store_name: supplier.storeName,
        store_description: supplier.storeDescription,
        logo_url: supplier.logoUrl,
        banner_url: supplier.bannerUrl,
        categories: supplier.categories,
        supplier_type: supplier.supplierType,
        verification_status: supplier.verificationStatus,
        minimum_order_sen: supplier.minimumOrderSen,
        rating: supplier.rating,
        rating_count: supplier.ratingCount,
        joined_at: supplier.joinedAt,
      })
      .select('id')
      .single();
    if (error || !data) throw new Error(`supplier_profiles insert failed for ${supplier.storeName}: ${error?.message}`);
    supplierProfileIds.set(supplier.id, data.id);
  }
  console.log(`Created ${seed.supplierProfiles.length} supplier profiles.`);

  // ---- Verification documents --------------------------------------------
  for (const doc of seed.supplierVerificationDocuments) {
    const { error } = await supabase.from('supplier_verification_documents').insert({
      supplier_id: supplierProfileIds.get(doc.supplierId),
      doc_type: doc.docType,
      file_url: doc.fileUrl,
      status: doc.status,
      uploaded_at: doc.uploadedAt,
      reviewed_at: doc.reviewedAt,
    });
    if (error) throw new Error(`supplier_verification_documents insert failed: ${error.message}`);
  }

  // ---- Delivery zones -----------------------------------------------------
  for (const zone of seed.deliveryZones) {
    const { error } = await supabase.from('delivery_zones').insert({
      supplier_id: supplierProfileIds.get(zone.supplierId),
      district: zone.district,
      delivery_fee_sen: zone.deliveryFeeSen,
      free_delivery_threshold_sen: zone.freeDeliveryThresholdSen,
      eta_hours_min: zone.etaHoursMin,
      eta_hours_max: zone.etaHoursMax,
    });
    if (error) throw new Error(`delivery_zones insert failed: ${error.message}`);
  }
  console.log(`Created ${seed.deliveryZones.length} delivery zones.`);

  // ---- Categories -----------------------------------------------------------
  for (const cat of seed.categories) {
    const { data, error } = await supabase
      .from('categories')
      .insert({ slug: cat.slug, name: cat.name, name_ms: cat.nameMs, icon: cat.icon })
      .select('id')
      .single();
    if (error || !data) throw new Error(`categories insert failed for ${cat.slug}: ${error?.message}`);
    categoryIds.set(cat.id, data.id);
  }
  console.log(`Created ${seed.categories.length} categories.`);

  // ---- Products, images, price tiers --------------------------------------
  for (const product of seed.products) {
    const { data, error } = await supabase
      .from('products')
      .insert({
        supplier_id: supplierProfileIds.get(product.supplierId),
        category_id: categoryIds.get(product.categoryId),
        name: product.name,
        name_ms: product.nameMs,
        description: product.description,
        unit: product.unit,
        pack_size: product.packSize,
        base_price_sen: product.basePriceSen,
        stock_qty: product.stockQty,
        min_order_qty: product.minOrderQty,
        prep_time_hours: product.prepTimeHours,
        is_active: product.isActive,
        is_halal: product.isHalal,
        created_at: product.createdAt,
      })
      .select('id')
      .single();
    if (error || !data) throw new Error(`products insert failed for ${product.name}: ${error?.message}`);
    productIds.set(product.id, data.id);

    if (product.images.length > 0) {
      const { error: imgError } = await supabase.from('product_images').insert(
        product.images.map((img) => ({ product_id: data.id, url: img.url, position: img.position, alt_text: img.altText })),
      );
      if (imgError) throw new Error(`product_images insert failed for ${product.name}: ${imgError.message}`);
    }
    if (product.priceTiers.length > 0) {
      const { error: tierError } = await supabase.from('product_price_tiers').insert(
        product.priceTiers.map((t) => ({ product_id: data.id, min_qty: t.minQty, max_qty: t.maxQty, price_per_unit_sen: t.pricePerUnitSen })),
      );
      if (tierError) throw new Error(`product_price_tiers insert failed for ${product.name}: ${tierError.message}`);
    }
  }
  console.log(`Created ${seed.products.length} products.`);

  // ---- Orders + items -------------------------------------------------------
  for (const order of seed.orders) {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        buyer_id: buyerProfileIds.get(order.buyerId),
        supplier_id: supplierProfileIds.get(order.supplierId),
        status: order.status,
        fulfilment_method: order.fulfilmentMethod,
        district: order.district,
        delivery_address: order.deliveryAddress,
        payment_method: order.paymentMethod,
        subtotal_sen: order.subtotalSen,
        delivery_fee_sen: order.deliveryFeeSen,
        total_sen: order.totalSen,
        placed_at: order.placedAt,
        updated_at: order.updatedAt,
      })
      .select('id')
      .single();
    if (error || !data) throw new Error(`orders insert failed for ${order.orderNumber}: ${error?.message}`);
    orderIds.set(order.id, data.id);

    const { error: itemsError } = await supabase.from('order_items').insert(
      order.items.map((item) => ({
        order_id: data.id,
        product_id: productIds.get(item.productId),
        product_name: item.productName,
        unit: item.unit,
        qty: item.qty,
        unit_price_sen: item.unitPriceSen,
        line_total_sen: item.lineTotalSen,
      })),
    );
    if (itemsError) throw new Error(`order_items insert failed for ${order.orderNumber}: ${itemsError.message}`);

    await supabase.from('payments').insert({
      order_id: data.id,
      method: order.paymentMethod,
      amount_sen: order.totalSen,
      status: order.status === 'cancelled' ? 'unpaid' : order.status === 'pending_payment' ? 'unpaid' : 'paid',
      provider: 'manual',
    });
  }
  console.log(`Created ${seed.orders.length} orders.`);

  // ---- Reviews ----------------------------------------------------------
  for (const review of seed.reviews) {
    const { error } = await supabase.from('reviews').insert({
      order_id: orderIds.get(review.orderId),
      buyer_id: buyerProfileIds.get(review.buyerId),
      supplier_id: supplierProfileIds.get(review.supplierId),
      rating: review.rating,
      comment: review.comment,
      created_at: review.createdAt,
    });
    if (error) throw new Error(`reviews insert failed: ${error.message}`);
  }

  // ---- Quotations ---------------------------------------------------------
  for (const quotation of seed.quotations) {
    const { data, error } = await supabase
      .from('quotation_requests')
      .insert({
        buyer_id: buyerProfileIds.get(quotation.buyerId),
        supplier_id: supplierProfileIds.get(quotation.supplierId),
        status: quotation.status,
        message: quotation.message,
        supplier_response: quotation.supplierResponse,
        valid_until: quotation.validUntil,
        total_sen: quotation.totalSen,
        created_at: quotation.createdAt,
        updated_at: quotation.updatedAt,
      })
      .select('id')
      .single();
    if (error || !data) throw new Error(`quotation_requests insert failed: ${error?.message}`);
    quotationIds.set(quotation.id, data.id);

    const { error: itemsError } = await supabase.from('quotation_items').insert(
      quotation.items.map((item) => ({
        quotation_id: data.id,
        product_id: item.productId ? productIds.get(item.productId) : undefined,
        description: item.description,
        qty: item.qty,
        unit: item.unit,
        proposed_price_sen: item.proposedPriceSen,
      })),
    );
    if (itemsError) throw new Error(`quotation_items insert failed: ${itemsError.message}`);
  }
  console.log(`Created ${seed.quotations.length} quotation requests.`);

  // Backfill converted_order_id + is_from_quotation_id now that both ids exist.
  for (const quotation of seed.quotations) {
    if (quotation.convertedOrderId) {
      await supabase
        .from('quotation_requests')
        .update({ converted_order_id: orderIds.get(quotation.convertedOrderId) })
        .eq('id', quotationIds.get(quotation.id));
    }
  }

  // ---- Messaging ------------------------------------------------------------
  for (const thread of seed.messageThreads) {
    const { data, error } = await supabase
      .from('message_threads')
      .insert({
        buyer_id: buyerProfileIds.get(thread.buyerId),
        supplier_id: supplierProfileIds.get(thread.supplierId),
        last_message_at: thread.lastMessageAt,
        last_message_preview: thread.lastMessagePreview,
      })
      .select('id')
      .single();
    if (error || !data) throw new Error(`message_threads insert failed: ${error?.message}`);
    threadIds.set(thread.id, data.id);
  }
  for (const message of seed.messages) {
    const { error } = await supabase.from('messages').insert({
      thread_id: threadIds.get(message.threadId),
      sender_id: userIds.get(message.senderId),
      sender_role: message.senderRole,
      body: message.body,
      created_at: message.createdAt,
      read_at: message.readAt,
    });
    if (error) throw new Error(`messages insert failed: ${error.message}`);
  }
  console.log(`Created ${seed.messageThreads.length} message threads.`);

  // ---- Notifications ----------------------------------------------------
  for (const notif of seed.notifications) {
    const { error } = await supabase.from('notifications').insert({
      user_id: userIds.get(notif.userId),
      type: notif.type,
      title: notif.title,
      body: notif.body,
      href: notif.href,
      read_at: notif.readAt,
      created_at: notif.createdAt,
    });
    if (error) throw new Error(`notifications insert failed: ${error.message}`);
  }
  console.log(`Created ${seed.notifications.length} notifications.`);

  console.log('\nSeed complete! All demo accounts use the password:', SEED_PASSWORD);
  console.log('Example: sign in as', seed.users[0]?.email, '/', SEED_PASSWORD);
}

main().catch((err) => {
  console.error('\nSeed failed:', err);
  process.exit(1);
});
