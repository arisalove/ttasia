'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { LogOut } from 'lucide-react';
import { Logo } from './logo';
import { cn } from '@/lib/utils/cn';
import { LanguageSwitcher } from './language-switcher';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export function DashboardShell({
  navItems,
  bottomNavItems,
  userName,
  userSubtitle,
  children,
  topRight,
}: {
  navItems: NavItem[];
  bottomNavItems?: NavItem[];
  userName: string;
  userSubtitle: string;
  children: React.ReactNode;
  topRight?: React.ReactNode;
}) {
  const pathname = usePathname();
  const mobileItems = bottomNavItems ?? navItems.slice(0, 5);

  return (
    <div className="min-h-screen bg-surface-warm">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active ? 'bg-primary-50 text-primary-700' : 'text-ink-soft hover:bg-surface-muted',
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </span>
                {!!item.badge && (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">{item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
              {userName.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{userName}</p>
              <p className="truncate text-xs text-muted-foreground">{userSubtitle}</p>
            </div>
          </div>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="tap-target flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-surface-muted"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </form>
        </div>
      </aside>

      {/* Main column */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/90 px-4 backdrop-blur lg:px-8">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="hidden text-sm text-muted-foreground lg:block" />
          <div className="flex items-center gap-2">
            <LanguageSwitcher className="hidden sm:inline-flex" />
            {topRight}
          </div>
        </header>

        <main id="main-content" className="container-app py-6 pb-24 lg:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-white lg:hidden">
        {mobileItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'tap-target relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
              {!!item.badge && (
                <span className="absolute right-1/4 top-1 h-2 w-2 rounded-full bg-primary" aria-hidden />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
