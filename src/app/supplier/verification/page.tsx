import { CheckCircle2, Clock, ShieldAlert, ShieldX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VerificationUpload } from '@/components/supplier/verification-upload';
import { getSession } from '@/lib/auth/session';
import { getSupplierProfile, getVerificationDocuments } from '@/lib/data/suppliers';

const STATUS_META = {
  verified: { icon: CheckCircle2, color: 'text-success', label: 'Verified', description: 'Your storefront is live and visible to buyers.' },
  pending: { icon: Clock, color: 'text-warning', label: 'Under review', description: 'Admins are reviewing your documents. This usually takes 1–2 business days.' },
  unverified: { icon: ShieldAlert, color: 'text-muted-foreground', label: 'Not started', description: 'Submit your documents below to get verified and start selling.' },
  rejected: { icon: ShieldX, color: 'text-destructive', label: 'Rejected', description: 'Your last submission was rejected — check the note below and resubmit.' },
  suspended: { icon: ShieldX, color: 'text-destructive', label: 'Suspended', description: 'Your store has been suspended. Contact TapTap support for details.' },
} as const;

export default async function SupplierVerificationPage() {
  const session = await getSession();
  const [supplier, documents] = await Promise.all([
    getSupplierProfile(session!.supplierProfileId!),
    getVerificationDocuments(session!.supplierProfileId!),
  ]);
  if (!supplier) return null;

  const meta = STATUS_META[supplier.verificationStatus];
  const Icon = meta.icon;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Verification status</h1>

      <Card>
        <CardContent className="flex items-start gap-4 p-5">
          <Icon className={`mt-0.5 h-8 w-8 shrink-0 ${meta.color}`} />
          <div>
            <p className="text-lg font-semibold text-ink">{meta.label}</p>
            <p className="text-sm text-muted-foreground">{meta.description}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submit a document</CardTitle>
        </CardHeader>
        <CardContent>
          <VerificationUpload />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submission history</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents submitted yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {documents.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium capitalize text-ink">{d.docType.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted {new Date(d.uploadedAt).toLocaleDateString('en-MY', { dateStyle: 'medium' })}
                    </p>
                    {d.reviewNote && <p className="mt-1 text-xs text-destructive">{d.reviewNote}</p>}
                  </div>
                  <Badge variant={d.status === 'approved' ? 'success' : d.status === 'rejected' ? 'destructive' : 'warning'} className="capitalize">
                    {d.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
