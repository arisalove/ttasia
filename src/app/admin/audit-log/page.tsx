import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { getAuditLog, getAllUsers } from '@/lib/data/admin';

export default async function AdminAuditLogPage() {
  const [entries, users] = await Promise.all([getAuditLog(200), getAllUsers()]);
  const userNames = Object.fromEntries(users.map((u) => [u.id, u.fullName]));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Audit log</h1>
      <p className="text-sm text-muted-foreground">
        A record of admin actions and order status changes, for accountability and troubleshooting.
      </p>

      {entries.length === 0 ? (
        <EmptyState title="No audit entries yet" description="Actions like verification decisions and order status changes will be logged here." />
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-white">
          {entries.map((e) => (
            <div key={e.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div>
                <p className="text-sm text-ink">
                  <span className="font-semibold">{userNames[e.actorUserId] ?? e.actorUserId}</span>{' '}
                  <Badge variant="outline" className="mx-1 capitalize">
                    {e.actorRole}
                  </Badge>{' '}
                  {e.action.replace(/_/g, ' ').replace(/\./g, ' → ')} on {e.targetType} {e.targetId}
                </p>
                {e.metadata && <p className="mt-0.5 text-xs text-muted-foreground">{JSON.stringify(e.metadata)}</p>}
              </div>
              <span className="whitespace-nowrap text-xs text-muted-foreground">
                {new Date(e.createdAt).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
