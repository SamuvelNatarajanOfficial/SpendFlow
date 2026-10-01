import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ExpenseList } from './ExpenseList';
import type { Expense } from '../../types';

const expenses: Expense[] = [
  {
    id: '1',
    name: 'Rent',
    category: 'regular',
    amount: 15000,
    status: 'paid',
    dueDate: '2027-01-05',
  },
];

describe('ExpenseList', () => {
  it('renders an expense row for each expense', () => {
    render(<ExpenseList expenses={expenses} />);
    expect(screen.getByText('Rent')).toBeInTheDocument();
    expect(screen.getByText('₹15,000')).toBeInTheDocument();
  });

  it('renders an empty state when there are no expenses', () => {
    render(
      <ExpenseList
        expenses={[]}
        emptyTitle="No expenses yet"
        emptyDescription="Add one to get started."
      />,
    );
    expect(screen.getByText('No expenses yet')).toBeInTheDocument();
  });
});
