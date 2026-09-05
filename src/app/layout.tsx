import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { cookies } from 'next/headers';
import { Providers } from '@/components/providers';
import { LOCALE_COOKIE } from '@/lib/auth/cookies';
import { isLocale, DEFAULT_LOCALE } from '@/lib/i18n';
import '@/styles/globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'TapTap — You Tap, We Act.',
    template: '%s · TapTap',
  },
  description:
    "TapTap is a B2B F&B supply marketplace connecting Sabah's restaurants, cafés, bakeries and food stalls with verified suppliers of fresh produce, seafood, meat, dry goods and more.",
};

export const viewport: Viewport = {
  themeColor: '#FF6B00',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  const initialLocale = isLocale(localeCookie) ? localeCookie : DEFAULT_LOCALE;

  return (
    <html lang={initialLocale} className={jakarta.variable}>
      <body className="min-h-screen bg-background font-sans text-foreground">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers initialLocale={initialLocale}>{children}</Providers>
      </body>
    </html>
  );
}
