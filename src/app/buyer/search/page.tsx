import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProductListing, type ProductListingParams } from '@/components/product/product-listing';

export default async function SearchPage({ searchParams }: { searchParams: Promise<ProductListingParams> }) {
  const params = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <form className="flex gap-2" method="get">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={params.q} placeholder="Search products, categories, suppliers…" className="pl-9" />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {params.q ? (
        <ProductListing
          title={`Results for "${params.q}"`}
          filters={{ search: params.q, categorySlug: params.category }}
          searchParams={params}
          basePath="/buyer/search"
        />
      ) : (
        <p className="text-center text-muted-foreground">Start typing to search TapTap&apos;s catalogue.</p>
      )}
    </div>
  );
}
