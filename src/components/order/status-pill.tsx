import { Badge } from '@/components/ui/badge';
import { ORDER_STATUS_LABEL } from '@/lib/domain/orders';
import type { OrderStatus } from '@/lib/domain/types';
import { cn } from '@/lib/utils/cn';

const VARIANT_BY_STATUS: Record<OrderStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  pending_payment: 'warning',
  payment_submitted: 'default',
  awaiting_supplier_confirmation: 'default',
  confirmed: 'default',
  preparing: 'default',
  ready_for_pickup: 'success',
  out_for_delivery: 'default',
  delivered: 'success',
  completed: 'success',
  cancelled: 'secondary',
  disputed: 'destructive',
};

export function StatusPill({ status, locale = 'en', className }: { status: OrderStatus; locale?: 'en' | 'ms'; className?: string }) {
  return (
    <Badge variant={VARIANT_BY_STATUS[status]} className={cn('capitalize', className)}>
      {ORDER_STATUS_LABEL[status][locale]}
    </Badge>
  );
}
