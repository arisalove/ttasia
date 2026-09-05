'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Field } from '@/components/ui/field';
import { useToast } from '@/components/ui/toast';

const DOC_TYPES: { value: string; label: string }[] = [
  { value: 'ssm_registration', label: 'SSM business registration' },
  { value: 'halal_cert', label: 'Halal certification' },
  { value: 'business_license', label: 'Local business license' },
  { value: 'other', label: 'Other supporting document' },
];

export function VerificationUpload() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState('ssm_registration');
  const [uploading, setUploading] = useState(false);

  async function submit() {
    const file = fileInputRef.current?.files?.[0];
    setUploading(true);
    try {
      const res = await fetch('/api/supplier/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType, fileName: file?.name }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? 'Could not submit document.', 'error');
        return;
      }
      toast('Document submitted for review.', 'success');
      if (fileInputRef.current) fileInputRef.current.value = '';
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <Field id="docType" label="Document type" className="flex-1">
        <Select id="docType" value={docType} onChange={(e) => setDocType(e.target.value)}>
          {DOC_TYPES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </Select>
      </Field>
      <div className="flex-1">
        <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="text-sm" />
      </div>
      <Button onClick={submit} loading={uploading}>
        <Upload className="h-4 w-4" /> Submit for review
      </Button>
    </div>
  );
}
