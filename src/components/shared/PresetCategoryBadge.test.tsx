import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PresetCategoryBadge } from './PresetCategoryBadge';
import type { PresetCategory } from '../../types/sheets';

describe('PresetCategoryBadge', () => {
  it.each([
    ['HOME', 'Home'],
    ['LOAN', 'Loan'],
    ['BILL', 'Bill'],
    ['FAMILY', 'Family'],
    ['TRANSPORT', 'Transport'],
    ['OTHER', 'Other'],
  ] satisfies [PresetCategory, string][])('renders the %s label', (category, label) => {
    render(<PresetCategoryBadge category={category} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
