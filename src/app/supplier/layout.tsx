import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Package,
  Boxes,
  ClipboardList,
  FileText,
  MapPin,
  MessageCircle,
  BarChart3,
  ShieldCheck,
  Settings,
  Bell,
  Store,
} from 'lucide-react';
import { DashboardShell, type NavItem } from '@/components/layout/dashboard-shell';
import { getSession, dashboardPathForRole } from '@/lib/auth/session';
import { getNotifications } from '@/lib/data/notifications';
import { getOrdersForSupplier } from '@/lib/data/orders';
import { getQuotationsForSupplier } from '@/lib/data/quotations';
import { isTerminal } from '@/lib/domain/orders';

export default async function SupplierLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login?next=/supplier/dashboard');
  if (session.user.role !== 'supplier') redirect(dashboardPathForRole(session.user.role));
  if (!session.supplierProfileId) redirect('/login');

  const [notifications, orders, quotations] = await Promise.all([
    getNotifications(session.user.id),
    getOrdersForSupplier(session.supplierProfileId),
    getQuotationsForSupplier(session.supplierProfileId),
  ]);
  const unreadCount = notifications.filter((n) => !n.readAt).length;
  const activeOrderCount = orders.filter((o) => !isTerminal(o.status)).length;
  const pendingQuoteCount = quotations.filter((q) => q.status === 'requested').length;

  const navItems: NavItem[] = [
    { href: '/supplier/dashboard', label: 'Dashboard', icon: Home },
    { href: '/supplier/store', label: 'Store profile', icon: Store },
    { href: '/supplier/products', label: 'Products', icon: Package },
    { href: '/supplier/inventory', label: 'Inventory', icon: Boxes },
    { href: '/supplier/orders', label: 'Orders', icon: ClipboardList, badge: activeOrderCount || undefined },
    { href: '/supplier/quotations', label: 'Quotations', icon: FileText, badge: pendingQuoteCount || undefined },
    { href: '/supplier/delivery-zones', label: 'Delivery zones', icon: MapPin },
    { href: '/supplier/messages', label: 'Messages', icon: MessageCircle },
    { href: '/supplier/sales', label: 'Sales summary', icon: BarChart3 },
    { href: '/supplier/verification', label: 'Verification', icon: ShieldCheck },
    { href: '/supplier/settings', label: 'Settings', icon: Settings },
  ];

  const mobileNavItems: NavItem[] = [
    { href: '/supplier/dashboard', label: 'Home', icon: Home },
    { href: '/supplier/products', label: 'Products', icon: Package },
    { href: '/supplier/orders', label: 'Orders', icon: ClipboardList, badge: activeOrderCount || undefined },
    { href: '/supplier/quotations', label: 'RFQs', icon: FileText, badge: pendingQuoteCount || undefined },
    { href: '/supplier/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <DashboardShell
      navItems={navItems}
      bottomNavItems={mobileNavItems}
      userName={session.user.fullName}
      userSubtitle="Supplier account"
      topRight={
        <Link
          href="/supplier/notifications"
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
