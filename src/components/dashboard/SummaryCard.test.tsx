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
});
