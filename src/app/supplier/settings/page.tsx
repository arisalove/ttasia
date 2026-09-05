import { BusinessProfileForm } from '@/components/profile/business-profile-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSession } from '@/lib/auth/session';
import { getBusinessProfileForUser } from '@/lib/data/profile';
import { isDemoMode } from '@/lib/supabase/env';

export default async function SupplierSettingsPage() {
  const session = await getSession();
  const profile = await getBusinessProfileForUser(session!.user.id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Account settings</h1>

      {isDemoMode() && (
        <div className="rounded-xl border border-primary/30 bg-primary-50 px-4 py-3 text-sm text-ink">
          You&apos;re in <strong>demo mode</strong> — changes are saved for this session only.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-ink">{session!.user.fullName}</p>
            <p className="text-sm text-muted-foreground">{session!.user.email}</p>
          </div>
          <Badge variant="secondary" className="capitalize">
            {session!.user.role}
          </Badge>
        </CardContent>
      </Card>

      {profile ? (
        <Card>
          <CardHeader>
            <CardTitle>Registered business details</CardTitle>
          </CardHeader>
          <CardContent>
            <BusinessProfileForm profile={profile} action="/api/supplier/business-profile" />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-5 text-sm text-muted-foreground">We couldn&apos;t find a business profile linked to your account.</CardContent>
        </Card>
      )}
    </div>
  );
}
