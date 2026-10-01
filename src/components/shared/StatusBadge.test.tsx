import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it.each([
    ['paid', 'Paid'],
    ['pending', 'Pending'],
    ['overdue', 'Overdue'],
    ['skipped', 'Skipped'],
  ] as const)('renders the %s label', (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
