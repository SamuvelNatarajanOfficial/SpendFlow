import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ExpenseList } from './ExpenseList';
import type { ExpenseRowItem } from './ExpenseRow';

const items: ExpenseRowItem[] = [
  {
    id: '1',
    name: 'Rent',
    amount: 15000,
    dueDate: '2027-01-05',
    displayStatus: 'paid',
  },
];

describe('ExpenseList', () => {
  it('renders an expense row for each item', () => {
    render(<ExpenseList items={items} />);
    expect(screen.getByText('Rent')).toBeInTheDocument();
    expect(screen.getByText('₹15,000')).toBeInTheDocument();
  });

  it('renders an empty state when there are no items', () => {
    render(
      <ExpenseList
        items={[]}
        emptyTitle="No expenses yet"
        emptyDescription="Add one to get started."
      />,
    );
    expect(screen.getByText('No expenses yet')).toBeInTheDocument();
  });

  it('renders a per-item action via renderAction', async () => {
    const onMarkPaid = vi.fn();
    render(
      <ExpenseList
        items={items}
        renderAction={(item) => (
          <button type="button" onClick={() => onMarkPaid(item.id)}>
            Mark Pending
          </button>
        )}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Mark Pending' }));
    expect(onMarkPaid).toHaveBeenCalledWith('1');
  });

  it('renders a categoryBadge next to the name when provided', () => {
    const itemsWithBadge: ExpenseRowItem[] = [
      { ...items[0], categoryBadge: <span>Home</span> },
    ];
    render(<ExpenseList items={itemsWithBadge} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});
