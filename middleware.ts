import { NextResponse, type NextRequest } from 'next/server';
import type { CookieOptions } from '@supabase/ssr';
import { DEMO_SESSION_COOKIE, ROLE_COOKIE } from './src/lib/auth/cookies';

/**
 * Route protection. Demo mode reads a lightweight role cookie (set by the
 * login/signup API routes) so we can redirect without a DB round-trip inside
 * middleware. Live mode refreshes the Supabase auth session on every request
 * (the recommended @supabase/ssr pattern) and leaves fine-grained
 * role checks to each section's layout via `requireRole()`, which redirects
 * if the signed-in user's role doesn't match.
 */

const ROLE_PREFIXES: { prefix: string; role: 'buyer' | 'supplier' | 'admin' }[] = [
  { prefix: '/buyer', role: 'buyer' },
  { prefix: '/supplier', role: 'supplier' },
  { prefix: '/admin', role: 'admin' },
];

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = ROLE_PREFIXES.find((r) => pathname.startsWith(r.prefix));
  if (!match) return NextResponse.next();

  if (DEMO_MODE) {
    const userId = request.cookies.get(DEMO_SESSION_COOKIE)?.value;
    const role = request.cookies.get(ROLE_COOKIE)?.value;
    if (!userId) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    if (role && role !== match.role) {
      const url = request.nextUrl.clone();
      url.pathname = `/${role}/dashboard`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Live mode: refresh the Supabase session cookie via @supabase/ssr.
  let response = NextResponse.next({ request });
  try {
    const { createServerClient } = await import('@supabase/ssr');
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      },
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  } catch {
    // Supabase not configured / unreachable — fail open to the login page
    // rather than a hard crash.
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ['/buyer/:path*', '/supplier/:path*', '/admin/:path*'],
};
