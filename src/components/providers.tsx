'use client';

import { LocaleProvider } from '@/lib/i18n/LocaleProvider';
import { ToastProvider } from '@/components/ui/toast';
import type { Locale } from '@/lib/domain/types';

export function Providers({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  return (
    <LocaleProvider initialLocale={initialLocale}>
      <ToastProvider>{children}</ToastProvider>
    </LocaleProvider>
  );
}
