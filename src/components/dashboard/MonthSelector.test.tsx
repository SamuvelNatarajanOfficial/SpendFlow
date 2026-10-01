import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MonthSelector } from './MonthSelector';

describe('MonthSelector', () => {
  it('renders the month label', () => {
    render(<MonthSelector label="January 2027" onPrevious={vi.fn()} onNext={vi.fn()} />);
    expect(screen.getByText('January 2027')).toBeInTheDocument();
  });

  it('calls onPrevious and onNext when controls are clicked', async () => {
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    render(
      <MonthSelector label="January 2027" onPrevious={onPrevious} onNext={onNext} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    await userEvent.click(screen.getByRole('button', { name: 'Next month' }));

    expect(onPrevious).toHaveBeenCalledOnce();
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('disables controls at the boundaries', () => {
    render(
      <MonthSelector
        label="January 2027"
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        disablePrevious
        disableNext
      />,
    );

    expect(screen.getByRole('button', { name: 'Previous month' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled();
  });
});
