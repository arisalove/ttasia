'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import type { SupplierProfile } from '@/lib/domain/types';

interface FormValues {
  storeName: string;
  storeDescription: string;
  minimumOrderSen: number;
  logoUrl?: string;
  bannerUrl?: string;
}

export function StoreProfileForm({ supplier }: { supplier: SupplierProfile }) {
  const router = useRouter();
  const { toast } = useToast();
  const [minimumOrderRm, setMinimumOrderRm] = useState((supplier.minimumOrderSen / 100).toFixed(2));
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      storeName: supplier.storeName,
      storeDescription: supplier.storeDescription,
      logoUrl: supplier.logoUrl,
      bannerUrl: supplier.bannerUrl,
    },
  });

  async function onSubmit(values: Omit<FormValues, 'minimumOrderSen'>) {
    const minimumOrderSen = Math.round(parseFloat(minimumOrderRm || '0') * 100);
    const res = await fetch('/api/supplier/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, minimumOrderSen }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast(data.error ?? 'Could not save store profile.', 'error');
      return;
    }
    toast('Store profile updated.', 'success');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Field id="storeName" label="Store name" required error={errors.storeName?.message}>
        <Input id="storeName" {...register('storeName', { required: 'Enter your store name' })} error={!!errors.storeName} />
      </Field>
      <Field id="storeDescription" label="Store description" required error={errors.storeDescription?.message} hint="Shown on your public storefront page">
        <Textarea id="storeDescription" rows={4} {...register('storeDescription', { required: 'Add a description' })} />
      </Field>
      <Field id="minimumOrderRm" label="Minimum order value (RM)" hint="Buyers must reach this subtotal to checkout with your store">
        <Input id="minimumOrderRm" type="number" min={0} step="0.01" value={minimumOrderRm} onChange={(e) => setMinimumOrderRm(e.target.value)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="logoUrl" label="Logo image URL" hint="Paste an image URL for now">
          <Input id="logoUrl" {...register('logoUrl')} />
        </Field>
        <Field id="bannerUrl" label="Banner image URL" hint="Shown at the top of your storefront">
          <Input id="bannerUrl" {...register('bannerUrl')} />
        </Field>
      </div>
      <Button type="submit" loading={isSubmitting} className="mt-2 self-start">
        Save store profile
      </Button>
    </form>
  );
}
