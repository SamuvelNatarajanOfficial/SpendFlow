/**
 * All month arithmetic in the finance engine runs on 'YYYY-MM' strings
 * rather than Date objects, so comparisons are simple, timezone-free string
 * comparisons (zero-padded ISO-style strings sort the same as their dates).
 */

const MONTH_ID_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isValidMonthId(value: string): boolean {
  return MONTH_ID_PATTERN.test(value);
}

function assertValidMonthId(value: string): void {
  if (!isValidMonthId(value)) {
    throw new Error(`Invalid month ID "${value}"; expected format "YYYY-MM".`);
  }
}

export function formatMonthId(year: number, month: number): string {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}`;
}

export function parseMonthId(monthId: string): { year: number; month: number } {
  assertValidMonthId(monthId);
  const [year, month] = monthId.split('-').map(Number);
  return { year, month };
}

/** Negative if `a` is before `b`, positive if after, 0 if the same month. */
export function compareMonthIds(a: string, b: string): number {
  assertValidMonthId(a);
  assertValidMonthId(b);
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function addMonths(monthId: string, delta: number): string {
  const { year, month } = parseMonthId(monthId);
  const zeroBasedTotal = year * 12 + (month - 1) + delta;
  const newYear = Math.floor(zeroBasedTotal / 12);
  const newMonth = ((zeroBasedTotal % 12) + 12) % 12;
  return formatMonthId(newYear, newMonth + 1);
}

export function getCurrentMonthId(today: Date = new Date()): string {
  return formatMonthId(today.getFullYear(), today.getMonth() + 1);
}

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function getMonthLabel(monthId: string): string {
  const { year, month } = parseMonthId(monthId);
  return `${MONTH_LABELS[month - 1]} ${year}`;
}

/** Whether `monthId` falls within [startMonth, endMonth] (endMonth null = open-ended). */
export function isMonthInRange(
  monthId: string,
  startMonth: string,
  endMonth: string | null,
): boolean {
  if (compareMonthIds(monthId, startMonth) < 0) return false;
  if (endMonth !== null && compareMonthIds(monthId, endMonth) > 0) return false;
  return true;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Builds a 'YYYY-MM-DD' due date for `dueDay` within `monthId`, clamped to the month's length. */
export function computeDueDate(monthId: string, dueDay: number): string {
  const { year, month } = parseMonthId(monthId);
  const clampedDay = Math.min(Math.max(1, dueDay), daysInMonth(year, month));
  return `${formatMonthId(year, month)}-${String(clampedDay).padStart(2, '0')}`;
}

/** Formats a Date as a 'YYYY-MM-DD' id, usable in direct string comparison with due dates. */
export function toDateId(date: Date = new Date()): string {
  return `${formatMonthId(date.getFullYear(), date.getMonth() + 1)}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}
