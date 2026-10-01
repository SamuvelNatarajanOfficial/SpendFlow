import type { ItemStatus } from '../../types/sheets';
import type { DisplayStatus } from './statusEngine';

export interface TotalableItem {
  amount: number;
  status: ItemStatus;
  displayStatus: DisplayStatus;
}

export interface MonthTotals {
  salary: number;
  /** Sum of all non-skipped regular items — the planned figure, paid or not. */
  regularTotal: number;
  /** Sum of all non-skipped extra items — the planned figure, paid or not. */
  extraTotal: number;
  paidRegularTotal: number;
  paidExtraTotal: number;
  /** Pending and not yet overdue. */
  pendingRegularTotal: number;
  pendingExtraTotal: number;
  /** Regular + extra combined, for items past their due date. */
  overdueTotal: number;
  /** salary - regularTotal - extraTotal — the planned picture, not just what's been paid. */
  remainingBalance: number;
  completionPercentage: number;
  regularCompletionPercentage: number;
  extraCompletionPercentage: number;
}

function sumWhere(
  items: TotalableItem[],
  predicate: (item: TotalableItem) => boolean,
): number {
  return items.reduce((sum, item) => (predicate(item) ? sum + item.amount : sum), 0);
}

/** 100% when there's nothing to pay — an empty plan is a complete one. */
function completionOf(total: number, paid: number): number {
  if (total <= 0) return 100;
  return Math.round((paid / total) * 100);
}

const notSkipped = (item: TotalableItem) => item.status !== 'SKIPPED';
const isPaid = (item: TotalableItem) => item.status === 'PAID';
const isPendingNotOverdue = (item: TotalableItem) => item.displayStatus === 'pending';
const isOverdue = (item: TotalableItem) => item.displayStatus === 'overdue';

export function computeMonthTotals(params: {
  salary: number;
  regularItems: TotalableItem[];
  extraItems: TotalableItem[];
}): MonthTotals {
  const { salary, regularItems, extraItems } = params;

  const regularTotal = sumWhere(regularItems, notSkipped);
  const extraTotal = sumWhere(extraItems, notSkipped);
  const paidRegularTotal = sumWhere(regularItems, isPaid);
  const paidExtraTotal = sumWhere(extraItems, isPaid);
  const pendingRegularTotal = sumWhere(regularItems, isPendingNotOverdue);
  const pendingExtraTotal = sumWhere(extraItems, isPendingNotOverdue);
  const overdueTotal =
    sumWhere(regularItems, isOverdue) + sumWhere(extraItems, isOverdue);

  return {
    salary,
    regularTotal,
    extraTotal,
    paidRegularTotal,
    paidExtraTotal,
    pendingRegularTotal,
    pendingExtraTotal,
    overdueTotal,
    remainingBalance: salary - regularTotal - extraTotal,
    completionPercentage: completionOf(
      regularTotal + extraTotal,
      paidRegularTotal + paidExtraTotal,
    ),
    regularCompletionPercentage: completionOf(regularTotal, paidRegularTotal),
    extraCompletionPercentage: completionOf(extraTotal, paidExtraTotal),
  };
}
