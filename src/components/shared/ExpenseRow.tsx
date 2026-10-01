import type { Expense } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { StatusBadge } from './StatusBadge';

export interface ExpenseRowProps {
  expense: Expense;
}

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
});

export function ExpenseRow({ expense }: ExpenseRowProps) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-medium text-text">{expense.name}</span>
        <span className="text-xs text-muted">
          Due {dateFormatter.format(new Date(expense.dueDate))}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="font-medium text-text">{formatCurrency(expense.amount)}</span>
        <StatusBadge status={expense.status} />
      </div>
    </li>
  );
}
