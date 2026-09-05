import { ProductForm } from '@/components/supplier/product-form';
import { getCategories } from '@/lib/data/catalogue';

export default async function NewProductPage() {
  const categories = await getCategories();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Add a product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
