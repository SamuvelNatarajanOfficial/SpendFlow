import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('renders the label and percentage', () => {
    render(<ProgressBar label="Regular completion" value={72} />);

    expect(screen.getByText('Regular completion')).toBeInTheDocument();
    expect(screen.getByText('72%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '72');
  });

  it('clamps values above 100', () => {
    render(<ProgressBar label="Overfilled" value={150} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('clamps negative values to 0', () => {
    render(<ProgressBar label="Empty" value={-10} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
