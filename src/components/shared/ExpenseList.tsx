import type { Expense } from '../../types';
import { ExpenseRow } from './ExpenseRow';
import { EmptyState } from './EmptyState';

export interface ExpenseListProps {
  expenses: Expense[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ExpenseList({
  expenses,
  emptyTitle = 'No expenses yet',
  emptyDescription = 'Add an expense to see it listed here.',
}: ExpenseListProps) {
  if (expenses.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <ul className="flex flex-col gap-2">
      {expenses.map((expense) => (
        <ExpenseRow key={expense.id} expense={expense} />
      ))}
    </ul>
  );
}
