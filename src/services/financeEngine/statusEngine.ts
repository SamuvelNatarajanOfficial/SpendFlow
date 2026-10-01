import { compareMonthIds, getCurrentMonthId, toDateId } from './month';
import type { ItemStatus } from '../../types/sheets';

/** What the UI shows — unlike the stored status, this can be "overdue". */
export type DisplayStatus = 'paid' | 'pending' | 'overdue' | 'skipped';

/**
 * PAID and SKIPPED pass straight through. A PENDING item displays as
 * "overdue" once its due date has passed, or once its own month has fully
 * elapsed (a safety net for the rare case a due date doesn't reflect that,
 * e.g. data edited by hand) — otherwise it's "pending".
 */
export function computeDisplayStatus(
  status: ItemStatus,
  dueDate: string,
  itemMonth: string,
  today: Date = new Date(),
): DisplayStatus {
  if (status === 'PAID') return 'paid';
  if (status === 'SKIPPED') return 'skipped';

  const isPastDue = toDateId(today) > dueDate;
  const monthHasEnded = compareMonthIds(itemMonth, getCurrentMonthId(today)) < 0;

  return isPastDue || monthHasEnded ? 'overdue' : 'pending';
}
