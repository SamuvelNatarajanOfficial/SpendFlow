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
  return (
    <li className="flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-medium text-text">{item.name}</span>
        <span className="text-xs text-muted">
          Due {dateFormatter.format(new Date(item.dueDate))}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="font-medium text-text">{formatCurrency(item.amount)}</span>
        <StatusBadge status={item.displayStatus} />
        {action}
      </div>
    </li>
  );
}
