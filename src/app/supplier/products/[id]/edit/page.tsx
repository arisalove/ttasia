import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/supplier/product-form';
import { getCategories } from '@/lib/data/catalogue';
import { getProductsForSupplier } from '@/lib/data/suppliers';
import { getSession } from '@/lib/auth/session';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const [categories, products] = await Promise.all([getCategories(), getProductsForSupplier(session!.supplierProfileId!)]);
  const product = products.find((p) => p.id === id);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Edit product</h1>
      <ProductForm categories={categories} product={product} />
    </div>
  );
}
