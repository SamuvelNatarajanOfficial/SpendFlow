import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export type EmptyStateTone = 'neutral' | 'positive' | 'error';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: EmptyStateTone;
}

const toneStyles: Record<EmptyStateTone, { icon: string; iconWrap: string }> = {
  neutral: { icon: 'text-muted', iconWrap: 'bg-slate-100' },
  positive: { icon: 'text-regular', iconWrap: 'bg-regular/10' },
  error: { icon: 'text-overdue', iconWrap: 'bg-overdue/10' },
};

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  tone = 'neutral',
}: EmptyStateProps) {
  const styles = toneStyles[tone];

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <div
        className={cn(
          'flex size-12 items-center justify-center rounded-full',
          styles.iconWrap,
        )}
      >
        <Icon className={cn('size-6', styles.icon)} aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-medium text-text">{title}</p>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
