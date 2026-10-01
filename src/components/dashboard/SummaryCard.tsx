import type { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatCurrency } from '../../utils/currency';

export type SummaryCardTone =
  'primary' | 'regular' | 'extra' | 'neutral' | 'pending' | 'overdue';

export interface SummaryCardProps {
  label: string;
  amount: number;
  icon: LucideIcon;
  tone?: SummaryCardTone;
  className?: string;
}

const toneStyles: Record<SummaryCardTone, { icon: string; iconWrap: string }> = {
  primary: { icon: 'text-primary', iconWrap: 'bg-primary/10' },
  regular: { icon: 'text-regular', iconWrap: 'bg-regular/10' },
  extra: { icon: 'text-extra', iconWrap: 'bg-extra/10' },
  neutral: { icon: 'text-text', iconWrap: 'bg-slate-100' },
  pending: { icon: 'text-pending', iconWrap: 'bg-pending/10' },
  overdue: { icon: 'text-overdue', iconWrap: 'bg-overdue/10' },
};

export function SummaryCard({
  label,
  amount,
  icon: Icon,
  tone = 'neutral',
  className,
}: SummaryCardProps) {
  const styles = toneStyles[tone];

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm',
        className,
      )}
    >
      <div
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-full',
          styles.iconWrap,
        )}
      >
        <Icon className={cn('size-5', styles.icon)} aria-hidden="true" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm text-muted">{label}</span>
        <span className="text-xl font-semibold text-text">{formatCurrency(amount)}</span>
      </div>
    </div>
  );
}
