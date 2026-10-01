import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SegmentedBar } from './SegmentedBar';

describe('SegmentedBar', () => {
  it('renders an accessible summary covering every segment', () => {
    render(
      <SegmentedBar
        title="Planned Spending Breakdown"
        segments={[
          { label: 'Regular', value: 28500, colorClassName: 'bg-regular' },
          { label: 'Extra', value: 4500, colorClassName: 'bg-extra' },
        ]}
      />,
    );

    const chart = screen.getByRole('img', { name: /planned spending breakdown/i });
    expect(chart.getAttribute('aria-label')).toContain('Regular ₹28,500 (86%)');
    expect(chart.getAttribute('aria-label')).toContain('Extra ₹4,500 (14%)');
  });

  it('shows matching percentages and amounts in the visible legend', () => {
    render(
      <SegmentedBar
        title="Completion"
        segments={[
          { label: 'Paid', value: 75, colorClassName: 'bg-regular' },
          { label: 'Pending', value: 25, colorClassName: 'bg-pending' },
        ]}
      />,
    );

    expect(screen.getByText('Paid')).toBeInTheDocument();
    expect(screen.getByText('₹75')).toBeInTheDocument();
    expect(screen.getByText('(75%)')).toBeInTheDocument();
    expect(screen.getByText('(25%)')).toBeInTheDocument();
  });

  it('guarantees percentages sum to exactly 100 even on an awkward split', () => {
    render(
      <SegmentedBar
        title="Test split"
        segments={[
          { label: 'A', value: 99, colorClassName: 'bg-regular' },
          { label: 'B', value: 101, colorClassName: 'bg-extra' },
        ]}
      />,
    );

    const chart = screen.getByRole('img', { name: /test split/i });
    // 99/200 and 101/200 round independently to 50% and 51% (101 total) —
    // the component must correct that back to summing to 100.
    expect(chart.getAttribute('aria-label')).toMatch(/A ₹99 \(50%\), B ₹101 \(50%\)/);
  });

  it('shows the empty message when the total is zero', () => {
    render(
      <SegmentedBar
        title="Planned Spending Breakdown"
        segments={[
          { label: 'Regular', value: 0, colorClassName: 'bg-regular' },
          { label: 'Extra', value: 0, colorClassName: 'bg-extra' },
        ]}
        emptyMessage="Nothing planned yet."
      />,
    );

    expect(screen.getByText('Nothing planned yet.')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
