import Link from 'next/link';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function Pagination({
  page,
  totalPages,
  makeHref,
}: {
  page: number;
  totalPages: number;
  makeHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      <PageLink href={makeHref(Math.max(1, page - 1))} disabled={page <= 1} aria-label="Previous page">
        <ChevronLeft className="h-4 w-4" />
      </PageLink>

      {pages.map((p, i) => {
        const prev = pages[i - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1">
            {showEllipsis && <span className="px-1 text-sm text-muted-foreground">…</span>}
            <Link
              href={makeHref(p)}
              aria-current={p === page ? 'page' : undefined}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors',
                p === page ? 'bg-primary text-white' : 'text-ink-soft hover:bg-surface-muted',
              )}
            >
              {p}
            </Link>
          </span>
        );
      })}

      <PageLink href={makeHref(Math.min(totalPages, page + 1))} disabled={page >= totalPages} aria-label="Next page">
        <ChevronRight className="h-4 w-4" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  children,
  ...props
}: { href: string; disabled?: boolean; children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (disabled) {
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground/40" aria-disabled>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-surface-muted" {...props}>
      {children}
    </Link>
  );
}
