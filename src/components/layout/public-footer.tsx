import Link from 'next/link';
import { Logo } from './logo';

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-ink text-white">
      <div className="container-app grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo className="[&_span]:text-white [&_span_span]:text-primary-300" />
          <p className="mt-3 max-w-xs text-sm text-white/60">
            You Tap, We Act. A B2B F&amp;B supply marketplace for Sabah, Malaysia.
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-white/90">For buyers</p>
          <ul className="space-y-2 text-sm text-white/60">
            <li><Link href="/suppliers" className="hover:text-white">Browse suppliers</Link></li>
            <li><Link href="/how-it-works" className="hover:text-white">How it works</Link></li>
            <li><Link href="/signup?role=buyer" className="hover:text-white">Register your business</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-white/90">For suppliers</p>
          <ul className="space-y-2 text-sm text-white/60">
            <li><Link href="/signup?role=supplier" className="hover:text-white">List your products</Link></li>
            <li><Link href="/how-it-works" className="hover:text-white">Verification process</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-white/90">Coverage</p>
          <p className="text-sm text-white/60">
            Launching in Tawau, expanding across Sabah — Kota Kinabalu, Sandakan, Lahad Datu, Semporna, Kunak,
            Keningau, Kota Belud, Penampang and Putatan — then the rest of Malaysia.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/40">
        © {new Date().getFullYear()} TapTap Sdn Bhd (demo). All suppliers, products and orders shown are fictional
        sample data for demonstration purposes.
      </div>
    </footer>
  );
}
