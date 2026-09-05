import { NotificationList } from '@/components/notifications/notification-list';
import { getSession } from '@/lib/auth/session';
import { getNotifications } from '@/lib/data/notifications';

export default async function SupplierNotificationsPage() {
  const session = await getSession();
  const notifications = await getNotifications(session!.user.id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Notifications</h1>
      <NotificationList notifications={notifications} />
    </div>
  );
}
