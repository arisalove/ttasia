'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { signupSupplierSchema, type SignupSupplierInput } from '@/lib/domain/validation';
import { SABAH_DISTRICTS } from '@/lib/domain/types';

const SUPPLIER_TYPES = [
  { value: 'wholesaler', label: 'Wholesaler' },
  { value: 'farmer', label: 'Farmer' },
  { value: 'fisherman', label: 'Fisherman' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'manufacturer', label: 'Manufacturer' },
];

const CATEGORY_OPTIONS = [
  { value: 'vegetables-fruit', label: 'Fresh Vegetables & Fruit' },
  { value: 'seafood', label: 'Seafood' },
  { value: 'chicken-meat', label: 'Chicken & Meat' },
  { value: 'frozen', label: 'Frozen Products' },
  { value: 'dry-ingredients', label: 'Dry Ingredients' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'bakery-ingredients', label: 'Bakery Ingredients' },
  { value: 'food-packaging', label: 'Food Packaging' },
  { value: 'cleaning-supplies', label: 'Cleaning Supplies' },
  { value: 'kitchen-essentials', label: 'Commercial Kitchen Essentials' },
];

export default function SignupSupplierPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupSupplierInput>({
    resolver: zodResolver(signupSupplierSchema),
    defaultValues: { district: 'Tawau', supplierType: 'wholesaler', categories: [], minimumOrderSen: 5000 },
  });

  async function onSubmit(values: SignupSupplierInput) {
    setServerError(null);
    const res = await fetch('/api/auth/signup/supplier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      setServerError(data.error ?? 'Could not create your account.');
      return;
    }
    router.push(data.redirectTo ?? '/supplier/dashboard');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-warm px-4 py-10">
      <Logo className="mb-6" showTagline />
      <div className="w-full max-w-lg">
        <Card>
          <CardContent className="p-6">
            <h1 className="mb-1 text-xl font-bold text-ink">Apply as a supplier</h1>
            <p className="mb-6 text-sm text-muted-foreground">
              Applications are reviewed by TapTap Ops before your storefront goes live to buyers.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="fullName" label="Your full name" required error={errors.fullName?.message}>
                  <Input id="fullName" {...register('fullName')} error={!!errors.fullName} />
                </Field>
                <Field id="phone" label="Phone number" required error={errors.phone?.message}>
                  <Input id="phone" type="tel" placeholder="+60 12-345 6789" {...register('phone')} error={!!errors.phone} />
                </Field>
              </div>
              <Field id="email" label="Email" required error={errors.email?.message}>
                <Input id="email" type="email" {...register('email')} error={!!errors.email} />
              </Field>
              <Field id="password" label="Password" required hint="At least 6 characters" error={errors.password?.message}>
                <Input id="password" type="password" {...register('password')} error={!!errors.password} />
              </Field>

              <hr className="my-1 border-border" />

              <Field id="businessName" label="Registered business name" required error={errors.businessName?.message}>
                <Input id="businessName" {...register('businessName')} error={!!errors.businessName} />
              </Field>
              <Field id="registrationNumber" label="SSM registration number" required error={errors.registrationNumber?.message}>
                <Input id="registrationNumber" {...register('registrationNumber')} error={!!errors.registrationNumber} />
              </Field>
              <Field id="address" label="Business address" required error={errors.address?.message}>
                <Input id="address" {...register('address')} error={!!errors.address} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="district" label="District" required error={errors.district?.message}>
                  <Select id="district" {...register('district')} error={!!errors.district}>
                    {SABAH_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </Select>
                </Field>
                <Field id="postcode" label="Postcode" error={errors.postcode?.message}>
                  <Input id="postcode" {...register('postcode')} />
                </Field>
              </div>

              <hr className="my-1 border-border" />

              <Field id="storeName" label="Storefront name" required error={errors.storeName?.message}>
                <Input id="storeName" placeholder="e.g. Tawau Fresh Vegetable Co." {...register('storeName')} error={!!errors.storeName} />
              </Field>
              <Field id="storeDescription" label="Storefront description" required error={errors.storeDescription?.message}>
                <Textarea id="storeDescription" rows={3} {...register('storeDescription')} error={!!errors.storeDescription} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="supplierType" label="Supplier type" required error={errors.supplierType?.message}>
                  <Select id="supplierType" {...register('supplierType')} error={!!errors.supplierType}>
                    {SUPPLIER_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </Select>
                </Field>
                <Field id="minimumOrderSen" label="Minimum order (RM)" required error={errors.minimumOrderSen?.message}>
                  <Controller
                    name="minimumOrderSen"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="minimumOrderSen"
                        type="number"
                        min={0}
                        step="0.01"
                        value={field.value != null ? field.value / 100 : ''}
                        onChange={(e) => field.onChange(Math.round(Number(e.target.value || 0) * 100))}
                        error={!!errors.minimumOrderSen}
                      />
                    )}
                  />
                </Field>
              </div>

              <Controller
                name="categories"
                control={control}
                render={({ field }) => (
                  <fieldset>
                    <legend className="mb-1.5 text-sm font-medium text-ink">
                      Categories you supply <span className="text-destructive">*</span>
                    </legend>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {CATEGORY_OPTIONS.map((opt) => {
                        const checked = field.value?.includes(opt.value);
                        return (
                          <label key={opt.value} className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-2 text-sm">
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-primary"
                              checked={checked}
                              onChange={(e) => {
                                const next = e.target.checked
                                  ? [...(field.value ?? []), opt.value]
                                  : (field.value ?? []).filter((v: string) => v !== opt.value);
                                field.onChange(next);
                              }}
                            />
                            {opt.label}
                          </label>
                        );
                      })}
                    </div>
                    {errors.categories && (
                      <p className="mt-1 text-xs font-medium text-destructive">{errors.categories.message}</p>
                    )}
                  </fieldset>
                )}
              />

              {serverError && (
                <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                  {serverError}
                </p>
              )}

              <Button type="submit" loading={isSubmitting} className="mt-2">
                Submit application
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
