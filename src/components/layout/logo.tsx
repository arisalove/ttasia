import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

/**
 * TapTap wordmark: a fingertip "tap" ripple rendered as concentric arcs
 * behind a bold wordmark. Deliberately simple — one mark, one colour.
 */
export function Logo({ className, href = '/', showTagline = false }: { className?: string; href?: string; showTagline?: boolean }) {
  return (
    <Link href={href} className={cn('group inline-flex items-center gap-2', className)}>
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true" className="shrink-0">
        <circle cx="17" cy="17" r="16" fill="#FF6B00" />
        <circle cx="17" cy="17" r="11.5" stroke="white" strokeOpacity="0.55" strokeWidth="1.6" fill="none" />
        <circle cx="17" cy="17" r="6.5" stroke="white" strokeOpacity="0.8" strokeWidth="1.6" fill="none" />
        <circle cx="17" cy="17" r="2.4" fill="white" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="text-xl font-extrabold tracking-tight text-ink">
          Tap<span className="text-primary">Tap</span>
        </span>
        {showTagline && <span className="text-[11px] font-medium text-muted-foreground">You Tap, We Act.</span>}
      </span>
    </Link>
  );
}
