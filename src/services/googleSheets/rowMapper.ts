import { MalformedRowError } from './errors';
import type { ItemStatus, PresetCategory } from '../../types/sheets';

export interface ColumnDef<T> {
  header: string;
  toCell: (item: T) => string;
  fromCell: (item: T, raw: string) => T;
}

/**
 * Defines one column binding a single field of `T` to a sheet cell.
 *
 * Each call infers its own `K` independently, so the returned `ColumnDef<T>`
 * can sit in a plain array alongside columns for other fields — if the key
 * were kept in the public type instead, TypeScript would unify every
 * column's value type across the whole array (a `K extends keyof T`
 * generic erased too late). Keeping `K` local to this function is what
 * makes a heterogeneous column list type-check.
 */
export function column<T, K extends keyof T>(
  key: K,
  header: string,
  serialize: (value: T[K]) => string,
  parse: (raw: string) => T[K],
): ColumnDef<T> {
  return {
    header,
    toCell: (item) => serialize(item[key]),
    fromCell: (item, raw) => ({ ...item, [key]: parse(raw) }),
  };
}

export interface RowMapper<T> {
  headers: string[];
  toRow: (item: T) => string[];
  fromRow: (row: string[]) => T;
}

/** Builds a consistent, bidirectional mapping between a sheet row and a TS object. */
export function createRowMapper<T>(columns: ColumnDef<T>[]): RowMapper<T> {
  return {
    headers: columns.map((def) => def.header),
    toRow: (item) => columns.map((def) => def.toCell(item)),
    fromRow: (row) => {
      let result = {} as T;
      columns.forEach((def, index) => {
        const raw = row[index] ?? '';
        try {
          result = def.fromCell(result, raw);
        } catch (cause) {
          throw new MalformedRowError(
            `Invalid value "${raw}" for column "${def.header}".`,
            { cause },
          );
        }
      });
      return result;
    },
  };
}

const PRESET_CATEGORIES: readonly PresetCategory[] = [
  'HOME',
  'LOAN',
  'BILL',
  'FAMILY',
  'TRANSPORT',
  'OTHER',
];

const ITEM_STATUSES: readonly ItemStatus[] = ['PENDING', 'PAID', 'SKIPPED'];

/** Serializers for writing plain values into sheet cells. */
export const cell = {
  string: (value: string): string => value,
  number: (value: number): string => String(value),
  boolean: (value: boolean): string => (value ? 'TRUE' : 'FALSE'),
  nullableString: (value: string | null): string => value ?? '',
};

/** Parsers for reading sheet cells back into typed values; throw on bad input. */
export const parseCell = {
  string: (value: string): string => value,
  nullableString: (value: string): string | null => (value.trim() === '' ? null : value),
  number: (value: string): number => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      throw new Error(`Expected a number, got "${value}".`);
    }
    return parsed;
  },
  boolean: (value: string): boolean => value.trim().toUpperCase() === 'TRUE',
  status: (value: string): ItemStatus => {
    if (ITEM_STATUSES.includes(value as ItemStatus)) {
      return value as ItemStatus;
    }
    throw new Error(`Expected a status of ${ITEM_STATUSES.join('/')}, got "${value}".`);
  },
  presetCategory: (value: string): PresetCategory => {
    if (PRESET_CATEGORIES.includes(value as PresetCategory)) {
      return value as PresetCategory;
    }
    throw new Error(
      `Expected a category of ${PRESET_CATEGORIES.join('/')}, got "${value}".`,
    );
  },
};
