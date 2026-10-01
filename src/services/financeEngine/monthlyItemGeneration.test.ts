import { describe, expect, it } from 'vitest';
import {
  buildMonthlyItemFromPreset,
  buildMonthlyItemId,
  reconcileMonthlyItems,
} from './monthlyItemGeneration';
import type { MonthlyItem, RegularPreset } from '../../types/sheets';

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

describe('buildMonthlyItemId', () => {
  it('is deterministic for the same preset + month', () => {
    expect(buildMonthlyItemId('preset-1', '2027-01')).toBe(
      buildMonthlyItemId('preset-1', '2027-01'),
    );
  });

  it('differs for a different month', () => {
    expect(buildMonthlyItemId('preset-1', '2027-01')).not.toBe(
      buildMonthlyItemId('preset-1', '2027-02'),
    );
  });

  it('differs for a different preset', () => {
    expect(buildMonthlyItemId('preset-1', '2027-01')).not.toBe(
      buildMonthlyItemId('preset-2', '2027-01'),
    );
  });
});

describe('buildMonthlyItemFromPreset', () => {
  it("materializes a PENDING item with the preset's amount, category and a clamped due date", () => {
    const preset = makePreset({ dueDay: 31 });
    const item = buildMonthlyItemFromPreset(
      preset,
      '2027-02',
      '2027-02-01T00:00:00.000Z',
    );

    expect(item).toMatchObject({
      id: 'preset-1__2027-02',
      month: '2027-02',
      presetId: 'preset-1',
      name: 'Loan A',
      category: 'LOAN',
      amount: 7500,
      status: 'PENDING',
      dueDate: '2027-02-28',
      paidDate: '',
    });
  });
});

describe('reconcileMonthlyItems — duplicate prevention', () => {
  const loan = makePreset({ id: 'loan', startMonth: '2027-01', endMonth: '2027-06' });

  it('creates a monthly item the first time a month is opened', () => {
    const { toCreate } = reconcileMonthlyItems([loan], [], '2027-01');
    expect(toCreate).toHaveLength(1);
    expect(toCreate[0].id).toBe('loan__2027-01');
  });

  it('does not recreate the item when the month is opened again', () => {
    const { toCreate: firstOpen } = reconcileMonthlyItems([loan], [], '2027-01');
    const existingAfterPersist: MonthlyItem[] = firstOpen;

    const { toCreate: secondOpen } = reconcileMonthlyItems(
      [loan],
      existingAfterPersist,
      '2027-01',
    );

    expect(secondOpen).toHaveLength(0);
  });

  it('preserves an edited existing item instead of regenerating it', () => {
    const paidItem: MonthlyItem = {
      ...buildMonthlyItemFromPreset(loan, '2027-01'),
      status: 'PAID',
      paidDate: '2027-01-03',
    };

    const { existing, toCreate } = reconcileMonthlyItems([loan], [paidItem], '2027-01');

    expect(toCreate).toHaveLength(0);
    expect(existing[0].status).toBe('PAID');
  });

  it('generates items for multiple applicable presets in one pass', () => {
    const rent = makePreset({ id: 'rent', startMonth: '2027-01', endMonth: null });
    const { toCreate } = reconcileMonthlyItems([loan, rent], [], '2027-03');
    expect(toCreate.map((item) => item.presetId).sort()).toEqual(['loan', 'rent']);
  });

  it('does not generate an item for a preset outside its range (loan expiration)', () => {
    const { toCreate } = reconcileMonthlyItems([loan], [], '2027-07');
    expect(toCreate).toHaveLength(0);
  });

  it('does not generate an item for an inactive preset', () => {
    const inactiveLoan = { ...loan, active: false };
    const { toCreate } = reconcileMonthlyItems([inactiveLoan], [], '2027-02');
    expect(toCreate).toHaveLength(0);
  });
});
