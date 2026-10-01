import type { ReactNode } from 'react';
import type { DisplayStatus } from '../../services/financeEngine/statusEngine';
import { formatCurrency } from '../../utils/currency';
import { StatusBadge } from './StatusBadge';

export interface ExpenseRowItem {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  displayStatus: DisplayStatus;
  /** Rendered next to the name — e.g. a PresetCategoryBadge for regular items. */
  categoryBadge?: ReactNode;
}

export interface ExpenseRowProps {
  item: ExpenseRowItem;
  action?: ReactNode;
}

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
});

export function ExpenseRow({ item, action }: ExpenseRowProps) {
  const dueLabel = `Due ${dateFormatter.format(new Date(item.dueDate))}`;

  return (
    <li className="rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/30 sm:rounded-lg sm:px-4 sm:py-3">
      {/* Mobile: a vertical card with the amount as the focal point and a
          full-width tap target for the action — not just a shrunk row. */}
      <div className="flex flex-col gap-3 sm:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-text">{item.name}</span>
          {item.categoryBadge}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-2xl font-bold text-text">
            {formatCurrency(item.amount)}
          </span>
          <span className="text-sm text-muted">{dueLabel}</span>
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <StatusBadge status={item.displayStatus} />
          {action && <div className="[&>*]:w-full">{action}</div>}
        </div>
      </div>

      {/* Tablet and up: compact horizontal row. */}
      <div className="hidden sm:flex sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium text-text">{item.name}</span>
            {item.categoryBadge}
          </div>
          <span className="text-xs text-muted">{dueLabel}</span>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <span className="font-medium text-text">{formatCurrency(item.amount)}</span>
          <StatusBadge status={item.displayStatus} />
          {action}
        </div>
      </div>
    </li>
  );
}
