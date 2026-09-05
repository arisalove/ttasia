import { notFound } from 'next/navigation';
import { ProductListing, type ProductListingParams } from '@/components/product/product-listing';
import { getCategories } from '@/lib/data/catalogue';

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ProductListingParams>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  return (
    <ProductListing
      title={category.name}
      description={`All ${category.name.toLowerCase()} products from verified Sabah suppliers.`}
      filters={{ categorySlug: slug }}
      searchParams={sp}
      basePath={`/buyer/category/${slug}`}
      showCategoryFilter={false}
    />
  );
}
