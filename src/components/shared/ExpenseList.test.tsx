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

// ExpenseRow renders two parallel layouts (a mobile card, hidden via CSS
// below `sm:`, and a desktop row, hidden via CSS above it) so each piece of
// content appears twice in the DOM — jsdom doesn't evaluate media queries,
// so both copies are always "present" to queries. Assertions here use
// getAllBy*/findAllBy* to match that reality rather than assume a single copy.

describe('ExpenseList', () => {
  it('renders an expense row for each item', () => {
    render(<ExpenseList items={items} />);
    expect(screen.getAllByText('Rent').length).toBeGreaterThan(0);
    expect(screen.getAllByText('₹15,000').length).toBeGreaterThan(0);
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

    const [firstButton] = screen.getAllByRole('button', { name: 'Mark Pending' });
    await userEvent.click(firstButton);
    expect(onMarkPaid).toHaveBeenCalledWith('1');
  });

  it('renders a categoryBadge next to the name when provided', () => {
    const itemsWithBadge: ExpenseRowItem[] = [
      { ...items[0], categoryBadge: <span>Home</span> },
    ];
    render(<ExpenseList items={itemsWithBadge} />);
    expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
  });
});
