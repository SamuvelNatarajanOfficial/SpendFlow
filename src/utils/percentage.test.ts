import { describe, expect, it } from 'vitest';
import { computeSharePercentages } from './percentage';

describe('computeSharePercentages', () => {
  it('splits an even total evenly', () => {
    expect(computeSharePercentages([50, 50])).toEqual([50, 50]);
  });

  it('always sums to exactly 100 for two shares, even on an awkward split', () => {
    // 99/200 and 101/200 round independently to 50 and 51 (101 total) —
    // the residue correction must bring that back to exactly 100.
    const result = computeSharePercentages([99, 101]);
    expect(result[0] + result[1]).toBe(100);
  });

  it('always sums to exactly 100 for three shares that would round to 99 independently', () => {
    // 1/3 each rounds to 33/33/33 = 99 independently.
    const result = computeSharePercentages([1, 1, 1]);
    expect(result.reduce((sum, value) => sum + value, 0)).toBe(100);
  });

  it('gives a zero-value share a 0% when another share holds everything', () => {
    expect(computeSharePercentages([0, 100])).toEqual([0, 100]);
  });

  it('returns all zeros when the total is zero', () => {
    expect(computeSharePercentages([0, 0])).toEqual([0, 0]);
  });

  it('returns all zeros when the total is negative', () => {
    expect(computeSharePercentages([-5, -5])).toEqual([0, 0]);
  });

  it('matches hand-computed percentages for a realistic 3-way split', () => {
    // 28500 : 4500 : 17000, total 50000
    expect(computeSharePercentages([28500, 4500, 17000])).toEqual([57, 9, 34]);
  });
});
