import Link from 'next/link';
import { Store, ShoppingBag } from 'lucide-react';
import { Logo } from '@/components/layout/logo';
import { Card, CardContent } from '@/components/ui/card';

export default function SignupRoleSelectPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-warm px-4 py-10">
      <Logo className="mb-8" showTagline />
      <div className="w-full max-w-2xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-ink">How will you use TapTap?</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/signup/buyer">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
                <ShoppingBag className="h-10 w-10 text-primary" />
                <p className="text-lg font-bold text-ink">I&apos;m a buyer</p>
                <p className="text-sm text-muted-foreground">
                  Restaurant, café, bakery, catering business or food stall looking to source supplies.
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/signup/supplier">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
                <Store className="h-10 w-10 text-primary" />
                <p className="text-lg font-bold text-ink">I&apos;m a supplier</p>
                <p className="text-sm text-muted-foreground">
                  Wholesaler, farmer, fisherman, distributor or manufacturer wanting to reach F&amp;B buyers.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
