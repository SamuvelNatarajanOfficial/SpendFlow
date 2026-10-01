import { describe, expect, it } from 'vitest';
import { isPresetApplicable, selectApplicablePresets } from './presetMatching';
import type { RegularPreset } from '../../types/sheets';

function makePreset(overrides: Partial<RegularPreset> = {}): RegularPreset {
  return {
    id: 'preset-1',
    name: 'Loan A',
    category: 'LOAN',
    amount: 7500,
    startMonth: '2027-01',
    endMonth: '2027-12',
    dueDay: 5,
    active: true,
    notes: '',
    createdAt: '2027-01-01T00:00:00.000Z',
    updatedAt: '2027-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('isPresetApplicable — bounded loan', () => {
  const loan = makePreset({ startMonth: '2027-01', endMonth: '2027-12' });

  it.each(['2027-01', '2027-02', '2027-06', '2027-11', '2027-12'])(
    'applies to %s',
    (monthId) => {
      expect(isPresetApplicable(loan, monthId)).toBe(true);
    },
  );

  it('does not apply the month before it starts', () => {
    expect(isPresetApplicable(loan, '2026-12')).toBe(false);
  });

  it('does not apply the month after it ends (loan expiration)', () => {
    expect(isPresetApplicable(loan, '2028-01')).toBe(false);
  });
});

describe('isPresetApplicable — indefinite preset', () => {
  const rent = makePreset({ startMonth: '2027-01', endMonth: null });

  it('applies to its start month and every month after, indefinitely', () => {
    expect(isPresetApplicable(rent, '2027-01')).toBe(true);
    expect(isPresetApplicable(rent, '2030-06')).toBe(true);
  });

  it('does not apply before its start month', () => {
    expect(isPresetApplicable(rent, '2026-12')).toBe(false);
  });
});

describe('isPresetApplicable — inactive preset', () => {
  it('never applies once deactivated, even within its date range', () => {
    const inactive = makePreset({ active: false, startMonth: '2027-01', endMonth: null });
    expect(isPresetApplicable(inactive, '2027-06')).toBe(false);
  });
});

describe('selectApplicablePresets', () => {
  it('filters a mixed list down to only the presets applicable for the month', () => {
    const presets = [
      makePreset({ id: 'a', startMonth: '2027-01', endMonth: '2027-06' }),
      makePreset({ id: 'b', startMonth: '2027-07', endMonth: null }),
      makePreset({ id: 'c', startMonth: '2027-01', endMonth: null, active: false }),
    ];

    expect(selectApplicablePresets(presets, '2027-03').map((p) => p.id)).toEqual(['a']);
    expect(selectApplicablePresets(presets, '2027-09').map((p) => p.id)).toEqual(['b']);
  });
});
