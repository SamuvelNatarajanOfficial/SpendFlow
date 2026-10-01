import { describe, expect, it } from 'vitest';
import { computeMonthTotals, type TotalableItem } from './totals';

function item(
  amount: number,
  status: TotalableItem['status'],
  displayStatus: TotalableItem['displayStatus'],
): TotalableItem {
  return { amount, status, displayStatus };
}

describe('computeMonthTotals', () => {
  it('sums regular and extra totals, excluding skipped items', () => {
    const totals = computeMonthTotals({
      salary: 50000,
      regularItems: [
        item(15000, 'PAID', 'paid'),
        item(2000, 'PENDING', 'pending'),
        item(1000, 'SKIPPED', 'skipped'),
      ],
      extraItems: [item(500, 'PENDING', 'pending')],
    });

    expect(totals.regularTotal).toBe(17000);
    expect(totals.extraTotal).toBe(500);
  });

  it('splits paid, pending and overdue amounts separately', () => {
    const totals = computeMonthTotals({
      salary: 50000,
      regularItems: [
        item(15000, 'PAID', 'paid'),
        item(2000, 'PENDING', 'pending'),
        item(600, 'PENDING', 'overdue'),
      ],
      extraItems: [
        item(1500, 'PAID', 'paid'),
        item(2500, 'PENDING', 'pending'),
        item(500, 'PENDING', 'overdue'),
      ],
    });

    expect(totals.paidRegularTotal).toBe(15000);
    expect(totals.paidExtraTotal).toBe(1500);
    expect(totals.pendingRegularTotal).toBe(2000);
    expect(totals.pendingExtraTotal).toBe(2500);
    expect(totals.overdueTotal).toBe(1100);
  });

  it('computes remainingBalance from the planned totals, not just what is paid', () => {
    const totals = computeMonthTotals({
      salary: 50000,
      regularItems: [item(28500, 'PENDING', 'pending')],
      extraItems: [item(4500, 'PENDING', 'pending')],
    });

    expect(totals.remainingBalance).toBe(50000 - 28500 - 4500);
  });

  it('computes a combined completion percentage across regular + extra', () => {
    const totals = computeMonthTotals({
      salary: 50000,
      regularItems: [item(8000, 'PAID', 'paid'), item(2000, 'PENDING', 'pending')],
      extraItems: [],
    });

    expect(totals.regularCompletionPercentage).toBe(80);
    expect(totals.completionPercentage).toBe(80);
  });

  it('rounds the completion percentage', () => {
    const totals = computeMonthTotals({
      salary: 0,
      regularItems: [item(300, 'PAID', 'paid'), item(100, 'PENDING', 'pending')],
      extraItems: [],
    });

    expect(totals.regularCompletionPercentage).toBe(75);
  });

  it('treats a month with nothing planned as 100% complete', () => {
    const totals = computeMonthTotals({
      salary: 50000,
      regularItems: [],
      extraItems: [],
    });

    expect(totals.completionPercentage).toBe(100);
    expect(totals.regularCompletionPercentage).toBe(100);
    expect(totals.extraCompletionPercentage).toBe(100);
    expect(totals.remainingBalance).toBe(50000);
  });

  it('excludes skipped items from the completion calculation entirely', () => {
    const totals = computeMonthTotals({
      salary: 50000,
      regularItems: [item(1000, 'SKIPPED', 'skipped')],
      extraItems: [],
    });

    expect(totals.regularTotal).toBe(0);
    expect(totals.regularCompletionPercentage).toBe(100);
  });
});
