import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck, FileText, Repeat } from 'lucide-react';
import { PublicNavbar } from '@/components/layout/public-navbar';
import { PublicFooter } from '@/components/layout/public-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryIcon } from '@/components/product/category-icon';
import { getCategories, getSuppliers, getProducts } from '@/lib/data/catalogue';

export default async function LandingPage() {
  const [categories, suppliers, productResult] = await Promise.all([
    getCategories(),
    getSuppliers(),
    getProducts({ pageSize: 8 }),
  ]);

  const districts = new Set(suppliers.length ? ['Tawau', 'Kota Kinabalu', 'Sandakan', 'Semporna', 'Keningau', 'Penampang'] : []);

  return (
    <>
      <PublicNavbar />
      <main id="main-content">
        {/* Hero */}
        <section className="relative overflow-hidden bg-surface-warm">
          <div className="container-app grid gap-10 py-14 lg:grid-cols-2 lg:items-center lg:py-20">
            <div>
              <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                Now live in Tawau · expanding across Sabah
              </span>
              <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] text-ink sm:text-5xl">
                Sabah&apos;s F&amp;B businesses,{' '}
                <span className="text-primary">supplied.</span>
              </h1>
              <p className="mt-4 max-w-xl text-lg text-ink-soft">
                Fresh produce, seafood, meat, dry goods and packaging from verified Sabah suppliers — quoted, ordered
                and delivered in one place.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/signup?role=buyer">
                    I&apos;m a buyer — browse suppliers <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/signup?role=supplier">I&apos;m a supplier — list your products</Link>
                </Button>
              </div>
              <p className="mt-4 text-sm font-semibold text-ink-soft">You Tap, We Act.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Verified suppliers', value: `${suppliers.length}+` },
                { label: 'Products listed', value: `${productResult.total}+` },
                { label: 'Districts covered', value: `${districts.size}` },
                { label: 'Order statuses tracked', value: '11' },
              ].map((stat) => (
                <Card key={stat.label} className="bg-white">
                  <CardContent className="p-5">
                    <p className="text-3xl font-extrabold text-ink">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="container-app py-14">
          <h2 className="text-2xl font-bold text-ink">Popular categories</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/buyer/category/${cat.slug}`}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-white p-5 text-center transition-shadow hover:shadow-md"
              >
                <CategoryIcon icon={cat.icon} className="h-7 w-7 text-primary" />
                <span className="text-sm font-medium text-ink-soft">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-ink py-14 text-white">
          <div className="container-app">
            <h2 className="text-2xl font-bold">From tap to table, in a few steps</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: FileText, title: '1. Browse & compare', body: 'Search products across verified suppliers, compare prices and MOQs.' },
                { icon: ShieldCheck, title: '2. Order or request a quote', body: 'Checkout instantly, or negotiate bulk pricing via RFQ.' },
                { icon: Truck, title: '3. Track fulfilment', body: 'Follow your order from confirmation through delivery or pickup.' },
                { icon: Repeat, title: '4. Reorder in one tap', body: 'Repeat your weekly restock without rebuilding the cart.' },
              ].map((step) => (
                <div key={step.title} className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <step.icon className="h-6 w-6 text-primary-300" />
                  <p className="mt-3 font-semibold">{step.title}</p>
                  <p className="mt-1 text-sm text-white/60">{step.body}</p>
                </div>
              ))}
            </div>
            <Button asChild className="mt-8" variant="default">
              <Link href="/how-it-works">Learn more about how TapTap works</Link>
            </Button>
          </div>
        </section>

        {/* Featured suppliers */}
        <section className="container-app py-14">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-ink">Featured suppliers</h2>
            <Link href="/suppliers" className="text-sm font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {suppliers.slice(0, 4).map((supplier) => (
              <Link
                key={supplier.id}
                href={`/suppliers/${supplier.storeSlug}`}
                className="rounded-xl border border-border bg-white p-5 transition-shadow hover:shadow-md"
              >
                <p className="font-semibold text-ink">{supplier.storeName}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{supplier.storeDescription}</p>
                <p className="mt-3 text-xs font-medium text-primary-700">★ {supplier.rating.toFixed(1)} ({supplier.ratingCount})</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
