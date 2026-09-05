import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CommissionForm } from '@/components/admin/commission-form';
import { getCommissionPercent } from '@/lib/data/admin';

export default async function AdminCommissionsPage() {
  const percent = await getCommissionPercent();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Commission settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Platform commission rate</CardTitle>
        </CardHeader>
        <CardContent>
          <CommissionForm currentPercent={percent} />
        </CardContent>
      </Card>
    </div>
  );
}
