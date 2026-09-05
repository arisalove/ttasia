import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Home, ShieldCheck, Users, LayoutGrid, ClipboardList, Receipt, AlertTriangle, Percent, History, Bell } from 'lucide-react';
import { DashboardShell, type NavItem } from '@/components/layout/dashboard-shell';
import { getSession, dashboardPathForRole } from '@/lib/auth/session';
import { getNotifications } from '@/lib/data/notifications';
import { getPendingSuppliers, getDisputes } from '@/lib/data/admin';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login?next=/admin/dashboard');
  if (session.user.role !== 'admin') redirect(dashboardPathForRole(session.user.role));

  const [notifications, pendingSuppliers, disputes] = await Promise.all([
    getNotifications(session.user.id),
    getPendingSuppliers(),
    getDisputes(),
  ]);
  const unreadCount = notifications.filter((n) => !n.readAt).length;
  const openDisputes = disputes.filter((d) => d.status === 'open' || d.status === 'investigating').length;

  const navItems: NavItem[] = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/verification', label: 'Verification queue', icon: ShieldCheck, badge: pendingSuppliers.length || undefined },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/products', label: 'Products & categories', icon: LayoutGrid },
    { href: '/admin/orders', label: 'Order monitoring', icon: ClipboardList },
    { href: '/admin/receipts', label: 'Receipt review', icon: Receipt },
    { href: '/admin/disputes', label: 'Disputes', icon: AlertTriangle, badge: openDisputes || undefined },
    { href: '/admin/commissions', label: 'Commission settings', icon: Percent },
    { href: '/admin/audit-log', label: 'Audit log', icon: History },
  ];

  const mobileNavItems: NavItem[] = [
    { href: '/admin/dashboard', label: 'Home', icon: Home },
    { href: '/admin/verification', label: 'Verify', icon: ShieldCheck, badge: pendingSuppliers.length || undefined },
    { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
    { href: '/admin/disputes', label: 'Disputes', icon: AlertTriangle, badge: openDisputes || undefined },
    { href: '/admin/users', label: 'Users', icon: Users },
  ];

  return (
    <DashboardShell
      navItems={navItems}
      bottomNavItems={mobileNavItems}
      userName={session.user.fullName}
      userSubtitle="TapTap admin"
      topRight={
        <Link
          href="/admin/notifications"
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
