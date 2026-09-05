'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { signupBuyerSchema, type SignupBuyerInput } from '@/lib/domain/validation';
import { SABAH_DISTRICTS } from '@/lib/domain/types';

const BUSINESS_TYPES = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Café' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'catering', label: 'Catering business' },
  { value: 'food_stall', label: 'Food stall' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'other', label: 'Other F&B business' },
];

export default function SignupBuyerPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupBuyerInput>({
    resolver: zodResolver(signupBuyerSchema),
    defaultValues: { district: 'Tawau', businessType: 'restaurant' },
  });

  async function onSubmit(values: SignupBuyerInput) {
    setServerError(null);
    const res = await fetch('/api/auth/signup/buyer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      setServerError(data.error ?? 'Could not create your account.');
      return;
    }
    router.push(data.redirectTo ?? '/buyer/dashboard');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-warm px-4 py-10">
      <Logo className="mb-6" showTagline />
      <div className="w-full max-w-lg">
        <Card>
          <CardContent className="p-6">
            <h1 className="mb-1 text-xl font-bold text-ink">Register your business</h1>
            <p className="mb-6 text-sm text-muted-foreground">Create a buyer account to start ordering from verified Sabah suppliers.</p>

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

              <Field id="businessName" label="Business name" required error={errors.businessName?.message}>
                <Input id="businessName" {...register('businessName')} error={!!errors.businessName} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="registrationNumber" label="SSM registration number" required error={errors.registrationNumber?.message}>
                  <Input id="registrationNumber" {...register('registrationNumber')} error={!!errors.registrationNumber} />
                </Field>
                <Field id="businessType" label="Business type" required error={errors.businessType?.message}>
                  <Select id="businessType" {...register('businessType')} error={!!errors.businessType}>
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </Select>
                </Field>
              </div>
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

              {serverError && (
                <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                  {serverError}
                </p>
              )}

              <Button type="submit" loading={isSubmitting} className="mt-2">
                Create buyer account
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
