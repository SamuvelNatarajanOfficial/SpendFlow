import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CategoryBadge } from './CategoryBadge';

describe('CategoryBadge', () => {
  it('renders the Regular label', () => {
    render(<CategoryBadge category="regular" />);
    expect(screen.getByText('Regular')).toBeInTheDocument();
  });

  it('renders the Extra label', () => {
    render(<CategoryBadge category="extra" />);
    expect(screen.getByText('Extra')).toBeInTheDocument();
  });
});
