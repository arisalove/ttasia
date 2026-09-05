import { getCategories, getProducts, type ProductFilters } from '@/lib/data/catalogue';
import { getFavourites } from '@/lib/data/favourites';
import { getSession } from '@/lib/auth/session';
import { ProductCard } from './product-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { Select } from '@/components/ui/select';
import { PackageSearch } from 'lucide-react';
import { SABAH_DISTRICTS } from '@/lib/domain/types';

export interface ProductListingParams {
  category?: string;
  q?: string;
  district?: string;
  sort?: string;
  halal?: string;
  page?: string;
}

export async function ProductListing({
  title,
  description,
  filters,
  searchParams,
  basePath,
  showCategoryFilter = true,
}: {
  title: string;
  description?: string;
  filters: ProductFilters;
  searchParams: ProductListingParams;
  basePath: string;
  showCategoryFilter?: boolean;
}) {
  const session = await getSession();
  const isBuyer = session?.user.role === 'buyer';

  const [result, categories, favourites] = await Promise.all([
    getProducts({
      ...filters,
      district: searchParams.district,
      sort: (searchParams.sort as ProductFilters['sort']) ?? 'relevance',
      halalOnly: searchParams.halal === '1',
      page: searchParams.page ? Number(searchParams.page) : 1,
    }),
    getCategories(),
    isBuyer && session?.buyerProfileId ? getFavourites(session.buyerProfileId) : Promise.resolve([]),
  ]);

  const favouriteProductIds = new Set(favourites.map((f) => f.productId).filter(Boolean));
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  function makeHref(overrides: Partial<ProductListingParams>) {
    const next = new URLSearchParams();
    const merged = { ...searchParams, ...overrides };
    Object.entries(merged).forEach(([key, value]) => {
      if (value) next.set(key, String(value));
    });
    const qs = next.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>

      <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" method="get">
        {searchParams.q && <input type="hidden" name="q" value={searchParams.q} />}
        {showCategoryFilter && (
          <Select name="category" defaultValue={searchParams.category ?? ''} aria-label="Category">
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </Select>
        )}
        <Select name="district" defaultValue={searchParams.district ?? ''} aria-label="District">
          <option value="">All districts</option>
          {SABAH_DISTRICTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </Select>
        <Select name="sort" defaultValue={searchParams.sort ?? 'relevance'} aria-label="Sort by">
          <option value="relevance">Sort: Relevance</option>
          <option value="price_asc">Price: Low to high</option>
          <option value="price_desc">Price: High to low</option>
          <option value="newest">Newest first</option>
        </Select>
        <label className="flex items-center gap-2 rounded-lg border border-border bg-white px-3.5 text-sm">
          <input type="checkbox" name="halal" value="1" defaultChecked={searchParams.halal === '1'} className="h-4 w-4 accent-primary" />
          Halal only
        </label>
        <button type="submit" className="sr-only">Apply filters</button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState
          icon={<PackageSearch />}
          title="No products found"
          description="Try adjusting your filters or search terms."
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{result.total} product{result.total === 1 ? '' : 's'} found</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {result.items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                supplier={product.supplier}
                isBuyer={isBuyer}
                isFavourite={favouriteProductIds.has(product.id)}
              />
            ))}
          </div>
          <Pagination page={result.page} totalPages={totalPages} makeHref={(p) => makeHref({ page: String(p) })} />
        </>
      )}
    </div>
  );
}
