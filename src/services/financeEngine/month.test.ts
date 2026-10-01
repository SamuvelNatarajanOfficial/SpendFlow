import { describe, expect, it } from 'vitest';
import {
  addMonths,
  compareMonthIds,
  computeDueDate,
  formatMonthId,
  getCurrentMonthId,
  getMonthLabel,
  isMonthInRange,
  isValidMonthId,
  parseMonthId,
  toDateId,
} from './month';

describe('formatMonthId / parseMonthId', () => {
  it('formats and parses a month ID symmetrically', () => {
    expect(formatMonthId(2027, 1)).toBe('2027-01');
    expect(formatMonthId(2027, 12)).toBe('2027-12');
    expect(parseMonthId('2027-01')).toEqual({ year: 2027, month: 1 });
  });

  it('rejects a malformed month ID', () => {
    expect(isValidMonthId('2027-13')).toBe(false);
    expect(isValidMonthId('2027-00')).toBe(false);
    expect(isValidMonthId('27-01')).toBe(false);
    expect(isValidMonthId('2027/01')).toBe(false);
    expect(() => parseMonthId('not-a-month')).toThrow();
  });
});

describe('compareMonthIds', () => {
  it('orders months chronologically within a year', () => {
    expect(compareMonthIds('2027-01', '2027-02')).toBeLessThan(0);
    expect(compareMonthIds('2027-02', '2027-01')).toBeGreaterThan(0);
    expect(compareMonthIds('2027-06', '2027-06')).toBe(0);
  });

  it('orders months correctly across a year boundary', () => {
    expect(compareMonthIds('2027-12', '2028-01')).toBeLessThan(0);
    expect(compareMonthIds('2028-01', '2027-12')).toBeGreaterThan(0);
  });
});

describe('addMonths', () => {
  it('adds months within the same year', () => {
    expect(addMonths('2027-01', 1)).toBe('2027-02');
    expect(addMonths('2027-01', 11)).toBe('2027-12');
  });

  it('rolls over into the next year', () => {
    expect(addMonths('2027-12', 1)).toBe('2028-01');
    expect(addMonths('2027-06', 12)).toBe('2028-06');
  });

  it('subtracts months and rolls back into the previous year', () => {
    expect(addMonths('2027-01', -1)).toBe('2026-12');
    expect(addMonths('2027-01', -13)).toBe('2025-12');
  });

  it('is a no-op for a delta of 0', () => {
    expect(addMonths('2027-06', 0)).toBe('2027-06');
  });
});

describe('getCurrentMonthId', () => {
  it('derives the month ID from a given date', () => {
    expect(getCurrentMonthId(new Date(2027, 0, 15))).toBe('2027-01');
    expect(getCurrentMonthId(new Date(2027, 11, 31))).toBe('2027-12');
  });
});

describe('getMonthLabel', () => {
  it('produces a human-readable label', () => {
    expect(getMonthLabel('2027-01')).toBe('January 2027');
    expect(getMonthLabel('2027-12')).toBe('December 2027');
  });
});

describe('isMonthInRange', () => {
  it('matches a month within a bounded range', () => {
    expect(isMonthInRange('2027-06', '2027-01', '2027-12')).toBe(true);
    expect(isMonthInRange('2027-01', '2027-01', '2027-12')).toBe(true);
    expect(isMonthInRange('2027-12', '2027-01', '2027-12')).toBe(true);
  });

  it('excludes a month before the start', () => {
    expect(isMonthInRange('2026-12', '2027-01', '2027-12')).toBe(false);
  });

  it('excludes a month after the end', () => {
    expect(isMonthInRange('2028-01', '2027-01', '2027-12')).toBe(false);
  });

  it('matches indefinitely when endMonth is null', () => {
    expect(isMonthInRange('2027-01', '2027-01', null)).toBe(true);
    expect(isMonthInRange('2099-12', '2027-01', null)).toBe(true);
  });

  it('still excludes months before the start when indefinite', () => {
    expect(isMonthInRange('2026-12', '2027-01', null)).toBe(false);
  });
});

describe('computeDueDate', () => {
  it('builds a due date from the month and day', () => {
    expect(computeDueDate('2027-01', 15)).toBe('2027-01-15');
  });

  it('clamps a day beyond the month length (Feb 31 -> Feb 28)', () => {
    expect(computeDueDate('2027-02', 31)).toBe('2027-02-28');
  });

  it('accounts for leap years when clamping', () => {
    expect(computeDueDate('2028-02', 31)).toBe('2028-02-29');
  });

  it('clamps a day below 1 up to 1', () => {
    expect(computeDueDate('2027-04', 0)).toBe('2027-04-01');
  });
});

describe('toDateId', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(toDateId(new Date(2027, 0, 5))).toBe('2027-01-05');
    expect(toDateId(new Date(2027, 10, 25))).toBe('2027-11-25');
  });
});
