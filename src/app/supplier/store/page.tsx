import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StoreProfileForm } from '@/components/supplier/store-profile-form';
import { getSession } from '@/lib/auth/session';
import { getSupplierProfile } from '@/lib/data/suppliers';

export default async function SupplierStorePage() {
  const session = await getSession();
  const supplier = await getSupplierProfile(session!.supplierProfileId!);
  if (!supplier) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink">Store profile</h1>
        <Link
          href={`/suppliers/${supplier.storeSlug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          View public storefront <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Store details</CardTitle>
          <Badge variant={supplier.verificationStatus === 'verified' ? 'success' : 'warning'} className="capitalize">
            {supplier.verificationStatus}
          </Badge>
        </CardHeader>
        <CardContent>
          <StoreProfileForm supplier={supplier} />
        </CardContent>
      </Card>
    </div>
  );
}
