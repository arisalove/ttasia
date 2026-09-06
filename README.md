# TapTap — You Tap, We Act.

TapTap is a B2B food & beverage supply marketplace MVP for restaurants, cafés, bakeries, caterers and food stalls
across Sabah, Malaysia to discover, compare and order from verified local suppliers of fresh produce, seafood,
meat, frozen goods, dry ingredients, beverages, bakery ingredients, packaging, cleaning supplies and kitchen
essentials.

This repository is a complete, runnable Next.js application covering the full buyer, supplier and admin journeys
described in the product brief, including a zero-setup **demo mode** that runs entirely in memory (no database
required) so the whole product can be explored immediately.

## Quick start (demo mode — no setup required)

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The app boots straight into **demo mode** (an in-memory, pre-seeded backend) because
no Supabase credentials are configured — see [Demo mode vs. live mode](#demo-mode-vs-live-mode) below. Log in with
any of the [demo accounts](#demo-accounts) using any non-empty password.

## Demo accounts

All demo accounts use the domain `@demo.taptap.my`. **In demo mode, any non-empty password works** — there is no
real authentication system wired up yet (see [Limitations](#known-limitations--whats-simulated)).

| Role | Email | Notes |
|---|---|---|
| Buyer | `buyer@demo.taptap.my` | Aiman Rizal — Warung Sedap Tawau |
| Buyer | `siti@demo.taptap.my` | Siti Norlia — Bahasa Melayu locale |
| Supplier | `tawaufresh@demo.taptap.my` | Tawau Fresh Vegetable Co. (verified) |
| Supplier | `borneodeepsea@demo.taptap.my` | Borneo Deep Sea Seafood (verified) |
| Supplier | `ranauhighland@demo.taptap.my` | Ranau Highland Poultry & Meats (verified) |
| Supplier | `kkfrozen@demo.taptap.my` | KK Frozen Solutions (verified) |
| Supplier | `sandakandry@demo.taptap.my` | Sandakan Dry Goods Trading (verified) |
| Supplier | `sabahbeverage@demo.taptap.my` | Sabah Beverage Distributors (verified) |
| Supplier | `goldenwheat@demo.taptap.my` | Golden Wheat Bakery Supplies — **pending verification** (useful for testing the admin verification queue) |
| Supplier | `ecopacksabah@demo.taptap.my` | EcoPack Sabah (verified) |
| Admin | `admin@demo.taptap.my` | TapTap Ops |

The login page also has one-click "fill demo account" buttons.

## Demo mode vs. live mode

Every data-access function in `src/lib/data/*.ts` branches on `isDemoMode()` (`src/lib/supabase/env.ts`):

- **Demo mode** (default): reads and writes an in-memory store (`src/lib/data/demo-store.ts`), seeded from
  `src/lib/data/seed-data.ts`. State resets whenever the server restarts and does not persist across multiple
  server instances — it exists purely so the entire app is clickable with zero setup. Login is a lightweight
  cookie set by `demoLogin()` (`src/lib/data/auth.ts`) — **not** real authentication.
- **Live mode**: set `NEXT_PUBLIC_DEMO_MODE=false` and provide real Supabase credentials (see `.env.example`).
  Every data function then talks to Postgres via Supabase, protected by Row Level Security, and auth goes through
  real Supabase Auth (`src/lib/supabase/server.ts`, `src/lib/auth/session.ts`).

This dual-mode design means the product is fully demonstrable today, and becomes a real, persisted, multi-tenant
system by flipping one environment variable once Supabase is provisioned and seeded.

## Setting up live mode (Supabase)

1. Create a project at [supabase.com](https://supabase.com) (or run the Supabase CLI locally).
2. Run the migrations in order against your project (`supabase/migrations/0001_init.sql`, `0002_rls.sql`,
   `0003_storage.sql`) — via the Supabase CLI (`supabase db push`) or by pasting them into the SQL editor.
3. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and
   `SUPABASE_SERVICE_ROLE_KEY` from your project's API settings. Set `NEXT_PUBLIC_DEMO_MODE=false`.
4. Seed the same fictional demo dataset into your real project: `npm run seed` (see
   `supabase/seed/seed.ts` — this creates real Supabase Auth users for every demo account, all sharing the
   password `TapTapDemo123!`).
5. `npm run dev`.

## Environment variables

See `.env.example` for the full, documented list. Summary:

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Live mode only | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Live mode only | Public anon key (safe for the browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Live mode + seeding | **Server-only.** Never exposed to the browser. |
| `NEXT_PUBLIC_SITE_URL` | No | Used for absolute links (e.g. future email templates) |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | No | `en` or `ms` |
| `NEXT_PUBLIC_DEMO_MODE` | No | Defaults to demo mode; set `false` once Supabase is configured |
| `PAYMENT_PROVIDER` | No | `manual` (default) or `fpx` (stubbed, not yet implemented) |

## Run commands

```bash
npm run dev         # start the dev server (demo mode by default)
npm run build        # production build
npm run start         # run the production build
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm run test          # unit tests (Vitest)
npm run test:watch    # unit tests, watch mode
npm run test:e2e      # Playwright end-to-end smoke tests
npm run seed          # populate a real Supabase project with the demo dataset
npm run format        # Prettier
```

> **A note on this build's provenance:** this codebase was authored in a sandboxed environment with no access to
> npm/PyPI/GitHub registries, so none of the commands above (`install`, `dev`, `build`, `lint`, `typecheck`,
> `test`) could actually be executed while writing the code. In place of a compiler/linter, every file was
> hand-reviewed, and two lightweight verification passes were run with a globally available TypeScript compiler:
> a full-repo **syntax check** (parsing all 160+ `.ts`/`.tsx` files with the TypeScript parser — 0 errors) and a
> **cross-reference check** confirming every internal `@/...` import resolves to a real file and every named
> import matches a real export. This substitutes for, but does not replace, actually running
> `npm install && npm run build && npm run lint && npm run test` — please run the full suite once you have
> network access, and treat the first `npm install` as the real correctness gate. See
> [Limitations](#known-limitations--whats-simulated) for specifics on what this implies.

## Tech stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript (strict mode)
- **Styling**: Tailwind CSS with a custom TapTap design system (`tailwind.config.ts`) + a small hand-rolled,
  shadcn/ui-style component library (`src/components/ui/*`) built on Radix primitives
- **Backend**: Supabase (Postgres, Auth, Storage) in live mode; an in-memory repository in demo mode
- **Forms & validation**: React Hook Form + Zod schemas shared between client forms and API route handlers
  (`src/lib/domain/validation.ts`)
- **Charts**: Recharts (supplier sales summary)
- **i18n**: a small dictionary-based EN/MS implementation (`src/lib/i18n`) — no heavy i18n framework dependency
- **Testing**: Vitest (domain logic unit tests) + Playwright (buyer/supplier/admin smoke tests)

## Architecture highlights

- **Money** is stored and computed as integer **sen** (1 RM = 100 sen) everywhere — see `src/lib/utils/money.ts`
  and the `bigint ..._sen` columns in the schema. Never floats.
- **Multi-supplier cart splitting**: a buyer's cart can span several suppliers; at checkout it is split into one
  order per supplier, each independently checked against that supplier's minimum order value and delivery
  coverage (`src/lib/domain/cart.ts`, `src/lib/data/orders.ts#checkoutCart`).
- **Order status state machine**: the 11 order statuses and their legal transitions are centrally defined in
  `src/lib/domain/orders.ts` (`canTransition`, `nextStatuses`, `actorForTransition`) and enforced both in the API
  route handlers and (conceptually) in the DB layer.
  Statuses: `pending_payment → payment_submitted → awaiting_supplier_confirmation → confirmed → preparing →
  {ready_for_pickup | out_for_delivery} → {delivered →} completed`, with `cancelled`/`disputed` reachable from most
  in-flight states.
- **Tiered wholesale pricing**: `resolveUnitPriceSen()` in `src/lib/domain/pricing.ts` resolves the correct
  per-unit price for a given quantity against a product's price tiers, falling back to the base price.
  Suppliers manage tiers from the product form (`src/components/supplier/product-form.tsx`).
- **Payments**: a modular `PaymentAdapter` interface (`src/lib/domain/payments/adapter.ts`) with a
  `ManualPaymentAdapter` (bank transfer / COD / COP) wired up today, and a stubbed `FpxPaymentAdapter` ready for a
  real payment gateway integration later. **No real money ever moves** — every payment surface in the UI says so
  explicitly, and the "upload receipt" flow only records a state transition, it does not process a charge.
- **RLS-first data model**: every table has Row Level Security enabled with policies scoped to the acting buyer,
  supplier or admin (`supabase/migrations/0002_rls.sql`), so the same Supabase project can safely serve the
  browser client directly.

## Project structure

```
src/
  app/                      Next.js App Router routes
    (public)                landing, how-it-works, supplier directory, login/signup
    buyer/                  buyer dashboard, catalogue, cart, checkout, RFQ, orders, messages, profile
    supplier/               supplier dashboard, products, inventory, orders, quotations, delivery zones, sales, verification, settings
    admin/                  marketplace overview, verification queue, users, products, orders, receipts, disputes, commissions, audit log
    api/                    Route Handlers backing every mutation (auth, cart, checkout, orders, rfq, messages, etc.)
  components/
    ui/                     hand-rolled shadcn/ui-style primitives (Button, Card, Field, Dialog, Toast, ...)
    layout/                 navbars, footer, dashboard shell (sidebar + mobile bottom nav)
    product/ cart/ order/ rfq/ messages/ notifications/  domain-specific UI
    supplier/ admin/ profile/                             role-specific forms & widgets
  lib/
    domain/                 pure business logic: types, pricing, cart, order state machine, payments, Zod schemas
    data/                   data-access layer — every function branches demo-mode vs. Supabase
    auth/                   session resolution + route guards (demo cookie or Supabase Auth)
    supabase/               Supabase client factories (browser / server / admin)
    i18n/                   EN/MS dictionaries + locale provider
    utils/                  money formatting, className helper
supabase/
  migrations/               0001_init.sql (schema), 0002_rls.sql (RLS policies), 0003_storage.sql (storage buckets)
  seed/seed.ts              populates a real Supabase project with the fictional demo dataset
tests/
  unit/                     Vitest tests for cart/pricing/order-status domain logic
  e2e/                      Playwright smoke tests for the buyer/supplier/admin journeys
```

## What was built

- **Public site**: landing page, "how it works", supplier directory with search, individual supplier storefronts,
  role-aware signup (buyer/supplier) and login with demo quick-fill.
- **Buyer journey**: dashboard, full catalogue with search/category/district/price/halal filters and pagination,
  product detail with tiered pricing, favourites (products & suppliers), multi-supplier cart with per-supplier MOQ
  warnings, checkout (delivery/pickup, district selection, bank transfer/COD/COP, automatic per-supplier order
  splitting), order confirmation, current orders + history, order detail/tracking with a visual status timeline,
  bank-transfer receipt "upload", reorder, post-completion rating, RFQ request + quotation review + accept-to-order,
  messaging with suppliers, notifications, business profile settings.
- **Supplier journey**: dashboard with KPIs and a verification-status banner, store profile editor, product
  management (add/edit with wholesale price tiers, active/hidden toggle), inventory/stock quick-edit, order list +
  detail with status-transition actions, quotation request inbox with per-item pricing response, delivery-zone
  manager (fee, free-delivery threshold, ETA per Sabah district), buyer messaging, sales summary with a revenue
  chart and top products, verification document submission + status, account/business settings.
- **Admin journey**: marketplace overview (GMV, counts, open disputes), supplier verification queue with
  approve/reject + notes, user management with suspend/reinstate, read-only product & category oversight, global
  order monitoring with a force-status-change escape hatch, a receipt-review queue (see note below), dispute
  resolution workflow, platform commission-rate setting, and a full audit log of admin/order-status actions.
- **Cross-cutting**: EN/MS locale switcher, responsive layouts (desktop sidebar + mobile bottom nav), accessible
  forms (labels, error text, focus states), loading/empty/error states throughout, toast notifications, no
  dead-end/non-functional buttons.

## Known limitations & what's simulated

This is explicitly an MVP built to demonstrate the full product surface, not a production-hardened system. Called
out here rather than left implicit:

- **No compiler/linter/test-runner was ever run against this code.** The sandbox this was built in has no network
  access to npm/PyPI/GitHub, so `npm install` has never succeeded here. Every file was hand-written and manually
  cross-checked (see the note under [Run commands](#run-commands)), but this is not a substitute for a real
  `npm install && npm run build && npm run lint && npm run typecheck && npm run test` pass — **treat that as an
  outstanding task**, not a formality, before relying on this build.
- **Demo-mode "authentication" is not real authentication.** It matches an email against the seed data and accepts
  any non-empty password, storing a plain session cookie. This is fine for demoing the product but must not be
  used as-is for real user data — live mode's Supabase Auth path is the real implementation.
- **File uploads are simulated.** Bank-transfer receipts and supplier verification documents record a filename and
  drive the real state transition (order → `payment_submitted`, supplier → `pending`), but the file itself is not
  persisted to storage in this pass. The Supabase Storage buckets (`payment-receipts`, `verification-docs`) and
  their RLS policies are already migrated and ready — wiring up the actual upload is the remaining step.
- **The admin receipt-review queue is a placeholder in demo mode** (returns empty) since there's no real upload
  queue behind it yet; in live mode it reads real `payment_receipts` rows once uploads are wired up.
- **FPX (and other real payment gateways) are stubbed, not implemented.** `FpxPaymentAdapter` throws until a real
  integration is added — the architecture (`PaymentAdapter` interface, `PAYMENT_PROVIDER` env var) is ready for it.
- **The admin "force status change" control on order detail reuses the supplier action set** (it doesn't yet
  expose every buyer-only transition) — a reasonable MVP scope cut, called out so it isn't mistaken for a bug.
- **Demo-mode state is in-memory and single-process.** It resets on server restart and won't work correctly behind
  multiple serverless instances — expected and fine for a demo, not fine for production (use live mode).
- Category management in the admin panel is currently **read-only** (view categories & product counts); creating/
  editing categories would need a small additional CRUD layer.
- **RFQ line items not tied to a catalogue product ("Custom item") can't auto-convert into an order.** The order
  table requires each line to reference a real product, so when a buyer accepts a quotation, only catalogue-linked
  items become order lines; any custom/free-text items are reported back to the buyer as "skipped" (with a toast
  naming them) so they can be arranged directly with the supplier via chat. Picking a catalogue product for a line
  item — offered by default whenever the chosen supplier has products — avoids this entirely.

## Phase-two recommendations

1. **Run the real toolchain first**: `npm install`, then `build`/`lint`/`typecheck`/`test`/`test:e2e`, and fix
   whatever that surfaces — this is the single highest-value next step given how this build was produced.
2. Wire up real file storage for receipts and verification documents (buckets already exist).
3. Replace demo-mode auth with Supabase Auth everywhere (already implemented for live mode — just needs
   `NEXT_PUBLIC_DEMO_MODE=false` plus real user signup flows tested end-to-end).
4. Implement the FPX payment adapter for real online payments.
5. Add category CRUD for admins, and a moderation action (hide/unpublish) on individual products.
6. Add push/email notifications (today, notifications are in-app only).
7. Add pagination/virtualization to the admin order-monitoring and audit-log tables once data volume grows.
8. Expand automated test coverage: more Playwright flows (supplier fulfilling an order end-to-end, RFQ
   negotiation, dispute resolution) and integration tests against a real Supabase test project.
#   T A P T A P 1  
 #   t t a s i a  
 