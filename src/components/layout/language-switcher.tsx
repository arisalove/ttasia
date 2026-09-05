'use client';

import { useLocale } from '@/lib/i18n/LocaleProvider';
import { cn } from '@/lib/utils/cn';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  return (
    <div className={cn('inline-flex items-center rounded-full border border-border p-0.5 text-xs font-semibold', className)}>
      {(['en', 'ms'] as const).map((code) => (
        <button
          key={code}
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          className={cn(
            'tap-target rounded-full px-2.5 py-1 uppercase transition-colors',
            locale === code ? 'bg-ink text-white' : 'text-ink-soft hover:bg-surface-muted',
          )}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
