'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { Card, CardContent } from '@/components/ui/card';

const DEMO_ACCOUNTS = [
  { label: 'Buyer — Warung Sedap Tawau', email: 'buyer@demo.taptap.my' },
  { label: 'Supplier — Tawau Fresh Vegetable Co.', email: 'tawaufresh@demo.taptap.my' },
  { label: 'Admin — TapTap Ops', email: 'admin@demo.taptap.my' },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not log in.');
        return;
      }
      router.push(searchParams.get('next') ?? data.redirectTo ?? '/');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <Field id="email" label="Email" required>
            <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field id="password" label="Password" required>
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          {error && (
            <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" loading={loading} className="mt-1">
            Log in
          </Button>
        </form>

        <div className="mt-6 rounded-lg bg-surface-muted p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Demo logins (any password)</p>
          <ul className="space-y-1.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <li key={acc.email}>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword('demo1234');
                  }}
                  className="text-left text-sm text-primary-700 hover:underline"
                >
                  {acc.label} — <span className="font-mono">{acc.email}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to TapTap?{' '}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-warm px-4 py-10">
      <Logo className="mb-6" showTagline />
      <div className="w-full max-w-sm">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
