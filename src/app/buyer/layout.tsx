import { redirect } from 'next/navigation';
import { Home, LayoutGrid, ShoppingCart, Package, Heart, MessageCircle, Bell, UserRound, FileText } from 'lucide-react';
import { DashboardShell, type NavItem } from '@/components/layout/dashboard-shell';
import { getSession, dashboardPathForRole } from '@/lib/auth/session';
import { getCartItems } from '@/lib/data/cart';
import { getNotifications } from '@/lib/data/notifications';
import Link from 'next/link';

export default async function BuyerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login?next=/buyer/dashboard');
  if (session.user.role !== 'buyer') redirect(dashboardPathForRole(session.user.role));
  if (!session.buyerProfileId) redirect('/login');

  const [cartItems, notifications] = await Promise.all([
    getCartItems(session.buyerProfileId),
    getNotifications(session.user.id),
  ]);
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const navItems: NavItem[] = [
    { href: '/buyer/dashboard', label: 'Dashboard', icon: Home },
    { href: '/buyer/catalogue', label: 'Catalogue', icon: LayoutGrid },
    { href: '/buyer/cart', label: 'Cart', icon: ShoppingCart, badge: cartItems.length || undefined },
    { href: '/buyer/orders', label: 'Orders', icon: Package },
    { href: '/buyer/rfq', label: 'Quotations', icon: FileText },
    { href: '/buyer/favourites', label: 'Favourites', icon: Heart },
    { href: '/buyer/messages', label: 'Messages', icon: MessageCircle },
    { href: '/buyer/notifications', label: 'Notifications', icon: Bell, badge: unreadCount || undefined },
    { href: '/buyer/profile', label: 'Profile', icon: UserRound },
  ];

  const mobileNavItems: NavItem[] = [
    { href: '/buyer/dashboard', label: 'Home', icon: Home },
    { href: '/buyer/catalogue', label: 'Catalogue', icon: LayoutGrid },
    { href: '/buyer/cart', label: 'Cart', icon: ShoppingCart, badge: cartItems.length || undefined },
    { href: '/buyer/orders', label: 'Orders', icon: Package },
    { href: '/buyer/profile', label: 'Profile', icon: UserRound },
  ];

  return (
    <DashboardShell
      navItems={navItems}
      bottomNavItems={mobileNavItems}
      userName={session.user.fullName}
      userSubtitle="Buyer account"
      topRight={
        <Link
          href="/buyer/notifications"
          className="tap-target relative hidden items-center justify-center rounded-full hover:bg-surface-muted sm:inline-flex"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />}
        </Link>
      }
    >
      {children}
    </DashboardShell>
  );
}
