import type { ReactNode } from 'react';
import { ExpenseRow, type ExpenseRowItem } from './ExpenseRow';
import { EmptyState } from './EmptyState';

export interface ExpenseListProps {
  items: ExpenseRowItem[];
  emptyTitle?: string;
  emptyDescription?: string;
  renderAction?: (item: ExpenseRowItem) => ReactNode;
}

export function ExpenseList({
  items,
  emptyTitle = 'No expenses yet',
  emptyDescription = 'Add an expense to see it listed here.',
  renderAction,
}: ExpenseListProps) {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <ExpenseRow key={item.id} item={item} action={renderAction?.(item)} />
      ))}
    </ul>
  );
}
