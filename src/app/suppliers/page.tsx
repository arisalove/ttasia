import Link from 'next/link';
import { Star } from 'lucide-react';
import { PublicNavbar } from '@/components/layout/public-navbar';
import { PublicFooter } from '@/components/layout/public-footer';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { getSuppliers, getCategories } from '@/lib/data/catalogue';
import { SABAH_DISTRICTS } from '@/lib/domain/types';

export const metadata = { title: 'Supplier directory' };

export default async function SupplierDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; district?: string }>;
}) {
  const params = await searchParams;
  const [suppliers, categories] = await Promise.all([getSuppliers(), getCategories()]);

  const filtered = suppliers.filter((s) => {
    if (params.category && !s.categories.includes(params.category)) return false;
    return true;
  });

  return (
    <>
      <PublicNavbar />
      <main id="main-content" className="container-app py-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-ink">Supplier directory</h1>
          <p className="text-ink-soft">Browse TapTap-verified suppliers across Sabah. All listings shown are demo data.</p>
        </div>

        <form className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" method="get">
          <Select name="category" defaultValue={params.category ?? ''} aria-label="Filter by category">
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </Select>
          <Select name="district" defaultValue={params.district ?? ''} aria-label="Filter by district">
            <option value="">All districts</option>
            {SABAH_DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </Select>
        </form>

        {filtered.length === 0 ? (
          <EmptyState className="mt-8" title="No suppliers match your filters" description="Try clearing a filter to see more results." />
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((supplier) => (
              <Link
                key={supplier.id}
                href={`/suppliers/${supplier.storeSlug}`}
                className="flex flex-col rounded-xl border border-border bg-white p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-ink">{supplier.storeName}</p>
                  <Badge variant="outline" className="capitalize shrink-0">{supplier.supplierType}</Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{supplier.storeDescription}</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary-700">
                  <Star className="h-3.5 w-3.5 fill-primary-700" /> {supplier.rating.toFixed(1)} ({supplier.ratingCount} ratings)
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {supplier.categories.map((c) => (
                    <Badge key={c} variant="secondary" className="text-[10px] capitalize">{c.replace(/-/g, ' ')}</Badge>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <PublicFooter />
    </>
  );
}
