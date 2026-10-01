import { CheckCircle2, Clock, AlertCircle, MinusCircle } from 'lucide-react';
import type { DisplayStatus } from '../../services/financeEngine/statusEngine';
import { cn } from '../../utils/cn';

export interface StatusBadgeProps {
  status: DisplayStatus;
  className?: string;
}

const statusConfig: Record<
  DisplayStatus,
  { label: string; icon: typeof CheckCircle2; classes: string }
> = {
  paid: {
    label: 'Paid',
    icon: CheckCircle2,
    classes: 'bg-regular/10 text-regular',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    classes: 'bg-pending/10 text-pending',
  },
  overdue: {
    label: 'Overdue',
    icon: AlertCircle,
    classes: 'bg-overdue/10 text-overdue',
  },
  skipped: {
    label: 'Skipped',
    icon: MinusCircle,
    classes: 'bg-slate-100 text-muted',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, icon: Icon, classes } = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
        classes,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
