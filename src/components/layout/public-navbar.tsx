'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './language-switcher';
import { useLocale } from '@/lib/i18n/LocaleProvider';

const LINKS = [
  { href: '/how-it-works', key: 'nav.howItWorks' as const },
  { href: '/suppliers', key: 'nav.suppliers' as const },
];

export function PublicNavbar() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
      <div className="container-app flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-ink-soft hover:text-ink">
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">{t('nav.login')}</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">{t('nav.signup')}</Link>
          </Button>
        </div>

        <button
          className="tap-target inline-flex items-center justify-center rounded-full md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-border bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="tap-target flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-surface-muted"
                onClick={() => setOpen(false)}
              >
                {t(link.key)}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between px-3">
              <LanguageSwitcher />
            </div>
            <div className="mt-2 flex flex-col gap-2 px-3">
              <Button asChild variant="outline">
                <Link href="/login">{t('nav.login')}</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">{t('nav.signup')}</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
