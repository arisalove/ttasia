import { Badge } from '@/components/ui/badge';
import { UserSuspendToggle } from '@/components/admin/user-suspend-toggle';
import { getAllUsers } from '@/lib/data/admin';

export default async function AdminUsersPage() {
  const users = await getAllUsers();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Users</h1>
      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-ink">{u.fullName}</td>
                <td className="px-4 py-3 text-ink-soft">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className="capitalize">
                    {u.role}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.suspended ? 'destructive' : 'success'}>{u.suspended ? 'Suspended' : 'Active'}</Badge>
                </td>
                <td className="px-4 py-3 text-ink-soft">{new Date(u.createdAt).toLocaleDateString('en-MY', { dateStyle: 'medium' })}</td>
                <td className="px-4 py-3">
                  {u.role !== 'admin' && <UserSuspendToggle userId={u.id} suspended={!!u.suspended} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
