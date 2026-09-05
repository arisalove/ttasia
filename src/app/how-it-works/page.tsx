import Link from 'next/link';
import { CheckCircle2, ShieldCheck, ShoppingCart, Truck, FileText, Repeat, Star, Store } from 'lucide-react';
import { PublicNavbar } from '@/components/layout/public-navbar';
import { PublicFooter } from '@/components/layout/public-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BUYER_STEPS = [
  { icon: FileText, title: 'Register your business', body: 'Sign up with your business name, SSM registration number, address and district.' },
  { icon: ShoppingCart, title: 'Browse & compare', body: 'Search products, filter by category or district, and compare prices, MOQs and delivery terms across suppliers.' },
  { icon: CheckCircle2, title: 'Order or request a quote', body: 'Checkout normal orders instantly, or submit an RFQ for bulk/negotiated pricing.' },
  { icon: Truck, title: 'Track fulfilment', body: 'Follow every order from confirmation through preparing, delivery/pickup and completion.' },
  { icon: Repeat, title: 'Reorder & rate', body: 'Repeat previous orders in one tap, and rate suppliers once an order is completed.' },
];

const SUPPLIER_STEPS = [
  { icon: ShieldCheck, title: 'Apply & get verified', body: 'Submit your SSM registration and business documents. TapTap Ops reviews and verifies your storefront.' },
  { icon: Store, title: 'Set up your storefront', body: 'Add products with units, pack sizes, tiered pricing, MOQs and stock. Configure delivery zones and fees.' },
  { icon: FileText, title: 'Receive orders & RFQs', body: 'Get notified instantly, accept or modify quotations, and manage everything from one dashboard.' },
  { icon: Truck, title: 'Fulfil & update status', body: 'Move orders through preparing, ready-for-pickup or out-for-delivery, right up to completion.' },
  { icon: Star, title: 'Grow your reputation', body: 'Build ratings from completed orders and track sales performance over time.' },
];

export default function HowItWorksPage() {
  return (
    <>
      <PublicNavbar />
      <main id="main-content">
        <section className="bg-surface-warm py-14">
          <div className="container-app text-center">
            <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">How TapTap works</h1>
            <p className="mx-auto mt-3 max-w-2xl text-ink-soft">
              One marketplace for the whole B2B purchasing journey — from discovery to repeat orders — built for
              Sabah&apos;s F&amp;B businesses and their suppliers.
            </p>
          </div>
        </section>

        <section className="container-app py-14">
          <h2 className="text-2xl font-bold text-ink">For buyers</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {BUYER_STEPS.map((step, i) => (
              <Card key={step.title}>
                <CardHeader>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-700">
                    {i + 1}
                  </div>
                  <CardTitle className="pt-2 text-base">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground">{step.body}</CardContent>
              </Card>
            ))}
          </div>
          <Button asChild className="mt-6">
            <Link href="/signup?role=buyer">Register as a buyer</Link>
          </Button>
        </section>

        <section className="bg-ink py-14 text-white">
          <div className="container-app">
            <h2 className="text-2xl font-bold">For suppliers</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {SUPPLIER_STEPS.map((step, i) => (
                <div key={step.title} className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {i + 1}
                  </div>
                  <p className="mt-3 font-semibold">{step.title}</p>
                  <p className="mt-1 text-sm text-white/60">{step.body}</p>
                </div>
              ))}
            </div>
            <Button asChild className="mt-6" variant="default">
              <Link href="/signup?role=supplier">Apply as a supplier</Link>
            </Button>
          </div>
        </section>

        <section className="container-app py-14">
          <h2 className="text-2xl font-bold text-ink">Built for how Sabah F&amp;B businesses actually buy</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <p className="font-semibold text-ink">Multi-supplier carts</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Order vegetables, seafood and packaging in one checkout — TapTap automatically splits your cart
                  into separate orders per supplier, each respecting its own minimum order and delivery coverage.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="font-semibold text-ink">Flexible payment, honestly labelled</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Bank transfer with receipt upload, cash on delivery, or cash on pickup for the MVP — with a
                  modular payment layer ready for FPX. Demo mode never claims a real charge was processed.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="font-semibold text-ink">Verified, local suppliers</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Every supplier storefront goes through TapTap&apos;s verification queue before it&apos;s visible
                  to buyers — starting with Tawau, expanding across Sabah and beyond.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
