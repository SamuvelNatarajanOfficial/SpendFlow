import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders the title and description', () => {
    render(
      <EmptyState title="No presets yet" description="Create one to get started." />,
    );
    expect(screen.getByText('No presets yet')).toBeInTheDocument();
    expect(screen.getByText('Create one to get started.')).toBeInTheDocument();
  });

  it('renders the provided action', () => {
    render(<EmptyState title="Oops" action={<button type="button">Retry</button>} />);
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it.each(['neutral', 'positive', 'error'] as const)(
    'renders without error for the %s tone',
    (tone) => {
      render(<EmptyState title="Some state" tone={tone} />);
      expect(screen.getByText('Some state')).toBeInTheDocument();
    },
  );
});
