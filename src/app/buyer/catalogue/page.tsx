import { ProductListing, type ProductListingParams } from '@/components/product/product-listing';

export default async function CataloguePage({ searchParams }: { searchParams: Promise<ProductListingParams> }) {
  const params = await searchParams;
  return (
    <ProductListing
      title="Product catalogue"
      description="Browse every active product from TapTap-verified Sabah suppliers."
      filters={{ categorySlug: params.category }}
      searchParams={params}
      basePath="/buyer/catalogue"
    />
  );
}
