'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { businessProfileSchema, type BusinessProfileInput } from '@/lib/domain/validation';
import { SABAH_DISTRICTS } from '@/lib/domain/types';
import type { BusinessProfile } from '@/lib/domain/types';

export function BusinessProfileForm({ profile, action = '/api/buyer/profile' }: { profile: BusinessProfile; action?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BusinessProfileInput>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      businessName: profile.businessName,
      address: profile.address,
      district: profile.district,
      postcode: profile.postcode,
      phone: profile.phone,
    },
  });

  async function onSubmit(values: BusinessProfileInput) {
    const res = await fetch(action, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      toast(data.error ?? 'Could not save your business details.', 'error');
      return;
    }
    toast('Business details updated.', 'success');
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Field id="businessName" label="Business name" required error={errors.businessName?.message}>
            <Input id="businessName" {...register('businessName')} error={!!errors.businessName} />
          </Field>
          <Field id="address" label="Business address" required error={errors.address?.message}>
            <Input id="address" {...register('address')} error={!!errors.address} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="district" label="District" required error={errors.district?.message}>
              <Select id="district" {...register('district')} error={!!errors.district}>
                {SABAH_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </Field>
            <Field id="postcode" label="Postcode" error={errors.postcode?.message}>
              <Input id="postcode" {...register('postcode')} />
            </Field>
          </div>
          <Field id="phone" label="Phone number" required error={errors.phone?.message}>
            <Input id="phone" type="tel" {...register('phone')} error={!!errors.phone} />
          </Field>
          <Button type="submit" loading={isSubmitting} className="mt-2 self-start">
            Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
