import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Dashboard } from './Dashboard';
import type { MonthData } from '../services/financeEngine/monthService';

const {
  loadMonth,
  markMonthlyItemPaid,
  markMonthlyItemPending,
  markExtraItemPaid,
  markExtraItemPending,
  setSalaryForMonth,
  createExtraItem,
} = vi.hoisted(() => ({
  loadMonth: vi.fn(),
  markMonthlyItemPaid: vi.fn(),
  markMonthlyItemPending: vi.fn(),
  markExtraItemPaid: vi.fn(),
  markExtraItemPending: vi.fn(),
  setSalaryForMonth: vi.fn(),
  createExtraItem: vi.fn(),
}));

vi.mock('../services/financeEngine/monthService', () => ({
  loadMonth,
  markMonthlyItemPaid,
  markMonthlyItemPending,
  markExtraItemPaid,
  markExtraItemPending,
  setSalaryForMonth,
  createExtraItem,
}));

function makeMonthData(): MonthData {
  return {
    monthId: '2027-01',
    salary: 50000,
    regularItems: [
      {
        id: 'loan__2027-01',
        month: '2027-01',
        presetId: 'loan',
        name: 'Home Loan',
        category: 'LOAN',
        amount: 7500,
        status: 'PENDING',
        dueDate: '2027-01-05',
        paidDate: '',
        notes: '',
        createdAt: '2027-01-01T00:00:00.000Z',
        updatedAt: '2027-01-01T00:00:00.000Z',
        displayStatus: 'overdue',
      },
    ],
    extraItems: [
      {
        id: 'extra-1',
        month: '2027-01',
        name: 'Weekend Trip',
        amount: 2500,
        status: 'PAID',
        dueDate: '2027-01-15',
        paidDate: '2027-01-14',
        notes: '',
        createdAt: '2027-01-01T00:00:00.000Z',
        updatedAt: '2027-01-01T00:00:00.000Z',
        displayStatus: 'paid',
      },
    ],
    totals: {
      salary: 50000,
      regularTotal: 7500,
      extraTotal: 2500,
      paidRegularTotal: 0,
      paidExtraTotal: 2500,
      pendingRegularTotal: 0,
      pendingExtraTotal: 0,
      overdueTotal: 7500,
      remainingBalance: 40000,
      completionPercentage: 25,
      regularCompletionPercentage: 0,
      extraCompletionPercentage: 100,
    },
  };
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders salary, summary cards, and both regular and extra items', async () => {
    loadMonth.mockResolvedValue(makeMonthData());
    render(<Dashboard />);

    expect(await screen.findAllByText('Home Loan')).not.toHaveLength(0);
    expect(screen.getAllByText('Weekend Trip').length).toBeGreaterThan(0);
    expect(screen.getAllByText('₹50,000').length).toBeGreaterThan(0);
    expect(screen.getByText('Overdue / Still Not Completed')).toBeInTheDocument();
  });

  it('flags the overdue regular item in its own section', async () => {
    loadMonth.mockResolvedValue(makeMonthData());
    render(<Dashboard />);

    await screen.findAllByText('Home Loan');
    // The item appears in both the Regular list and the Overdue section,
    // and ExpenseRow itself renders a mobile card + a desktop row for each
    // (one is always CSS-hidden in a real browser) — 2 sections x 2 layouts.
    expect(screen.getAllByText('Home Loan').length).toBe(4);
  });

  it('shows a positive empty state when nothing is overdue', async () => {
    const data = makeMonthData();
    data.regularItems[0].displayStatus = 'pending';
    loadMonth.mockResolvedValue(data);
    render(<Dashboard />);

    await screen.findAllByText('Home Loan');
    expect(screen.getByText('Nothing overdue')).toBeInTheDocument();
  });

  it('marks a regular item paid directly from the dashboard', async () => {
    loadMonth.mockResolvedValue(makeMonthData());
    markMonthlyItemPaid.mockResolvedValue({});
    render(<Dashboard />);

    await screen.findAllByText('Home Loan');
    const [firstMarkPaidButton] = screen.getAllByRole('button', { name: 'Mark Paid' });
    await userEvent.click(firstMarkPaidButton);

    expect(markMonthlyItemPaid).toHaveBeenCalledWith('loan__2027-01');
  });

  it('marks a paid extra item back to pending', async () => {
    loadMonth.mockResolvedValue(makeMonthData());
    markExtraItemPending.mockResolvedValue({});
    render(<Dashboard />);

    await screen.findAllByText('Weekend Trip');
    const [firstMarkPendingButton] = screen.getAllByRole('button', {
      name: 'Mark Pending',
    });
    await userEvent.click(firstMarkPendingButton);

    expect(markExtraItemPending).toHaveBeenCalledWith('extra-1');
  });

  it('shows a friendly error state when the month fails to load', async () => {
    loadMonth.mockRejectedValue(new Error('Network error. Try again.'));
    render(<Dashboard />);

    expect(await screen.findByText("Couldn't load this month")).toBeInTheDocument();
    expect(screen.getByText('Network error. Try again.')).toBeInTheDocument();
  });

  it('computes mathematically correct totals in the Month Summary section', async () => {
    loadMonth.mockResolvedValue(makeMonthData());
    render(<Dashboard />);

    await screen.findAllByText('Home Loan');
    expect(screen.getByText('Month Summary')).toBeInTheDocument();
    // Planned Total = regularTotal (7500) + extraTotal (2500) = 10000
    expect(screen.getByText('₹10,000')).toBeInTheDocument();
  });
});
