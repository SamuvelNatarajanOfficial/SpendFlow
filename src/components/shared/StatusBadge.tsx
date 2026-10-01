import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import type { ExpenseStatus } from '../../types';
import { cn } from '../../utils/cn';

export interface StatusBadgeProps {
  status: ExpenseStatus;
  className?: string;
}

const statusConfig: Record<
  ExpenseStatus,
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
