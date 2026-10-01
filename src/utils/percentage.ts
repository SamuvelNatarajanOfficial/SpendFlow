/**
 * Rounds each value's share of the total to a whole percent while
 * guaranteeing the set sums to exactly 100 (when the total is positive) —
 * independently rounding each share can otherwise land on 99 or 101 due to
 * compounding rounding error. The last share absorbs the residue.
 */
export function computeSharePercentages(values: number[]): number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return values.map(() => 0);

  const percentages = values.map((value) => Math.round((value / total) * 100));
  const roundedSum = percentages.reduce((sum, value) => sum + value, 0);
  const lastIndex = percentages.length - 1;
  percentages[lastIndex] += 100 - roundedSum;
  return percentages;
}
