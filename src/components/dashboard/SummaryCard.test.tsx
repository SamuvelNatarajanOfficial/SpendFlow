import { render, screen } from '@testing-library/react';
import { Banknote } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { SummaryCard } from './SummaryCard';

describe('SummaryCard', () => {
  it('renders the label and formatted currency amount', () => {
    render(<SummaryCard label="Salary" amount={50000} icon={Banknote} />);

    expect(screen.getByText('Salary')).toBeInTheDocument();
    expect(screen.getByText('₹50,000')).toBeInTheDocument();
  });

  it('renders the subtext line when provided', () => {
    render(
      <SummaryCard
        label="Regular Needs"
        amount={28500}
        icon={Banknote}
        subtext="72% complete"
      />,
    );

    expect(screen.getByText('72% complete')).toBeInTheDocument();
  });

  it('omits the subtext line when not provided', () => {
    render(<SummaryCard label="Remaining" amount={17000} icon={Banknote} />);
    expect(screen.queryByText(/complete/)).not.toBeInTheDocument();
  });
});
