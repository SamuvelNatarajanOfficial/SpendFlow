import { describe, expect, it } from 'vitest';
import { cell, column, createRowMapper, parseCell } from './rowMapper';
import { MalformedRowError } from './errors';

interface Sample {
  id: string;
  amount: number;
  active: boolean;
}

const mapper = createRowMapper<Sample>([
  column('id', 'Id', cell.string, parseCell.string),
  column('amount', 'Amount', cell.number, parseCell.number),
  column('active', 'Active', cell.boolean, parseCell.boolean),
]);

describe('createRowMapper', () => {
  it('exposes headers in column order', () => {
    expect(mapper.headers).toEqual(['Id', 'Amount', 'Active']);
  });

  it('serializes an object into a row of strings', () => {
    expect(mapper.toRow({ id: 'abc', amount: 1500, active: true })).toEqual([
      'abc',
      '1500',
      'TRUE',
    ]);
  });

  it('parses a row back into a typed object', () => {
    expect(mapper.fromRow(['abc', '1500', 'TRUE'])).toEqual({
      id: 'abc',
      amount: 1500,
      active: true,
    });
  });

  it('round-trips an object through toRow and fromRow', () => {
    const original: Sample = { id: 'xyz', amount: 42, active: false };
    expect(mapper.fromRow(mapper.toRow(original))).toEqual(original);
  });

  it('treats a missing trailing cell as an empty string', () => {
    expect(mapper.fromRow(['abc', '10'])).toEqual({
      id: 'abc',
      amount: 10,
      active: false,
    });
  });

  it('throws MalformedRowError for an invalid cell value', () => {
    expect(() => mapper.fromRow(['abc', 'not-a-number', 'TRUE'])).toThrow(
      MalformedRowError,
    );
  });
});

describe('parseCell', () => {
  it('parses TRUE/FALSE case-insensitively', () => {
    expect(parseCell.boolean('true')).toBe(true);
    expect(parseCell.boolean('FALSE')).toBe(false);
    expect(parseCell.boolean('')).toBe(false);
  });

  it('parses a valid status', () => {
    expect(parseCell.status('paid')).toBe('paid');
  });

  it('throws for an invalid status', () => {
    expect(() => parseCell.status('unknown')).toThrow();
  });

  it('throws for a non-numeric amount', () => {
    expect(() => parseCell.number('abc')).toThrow();
  });
});
