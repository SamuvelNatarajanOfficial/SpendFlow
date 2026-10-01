import {
  appendRow,
  deleteRowByRowNumber,
  findRowIndexById,
  getSheetRows,
  updateRowByRowNumber,
} from './sheets';
import { NotFoundError } from './errors';
import type { RowMapper } from './rowMapper';

export interface SheetRepository<T> {
  list: () => Promise<T[]>;
  getById: (id: string) => Promise<T | null>;
  create: (item: T) => Promise<T>;
  update: (id: string, patch: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

export interface SheetRepositoryConfig<T> {
  sheetName: string;
  mapper: RowMapper<T>;
}

/**
 * Builds the standard read/append/update/delete/find-by-ID operations for one
 * sheet tab, keyed on the first column ("Id"). Entity-specific filters (e.g.
 * "by month") are added in each repository file on top of `list()`.
 */
export function createSheetRepository<T extends { id: string }>({
  sheetName,
  mapper,
}: SheetRepositoryConfig<T>): SheetRepository<T> {
  async function list(): Promise<T[]> {
    const { rows } = await getSheetRows(sheetName);
    return rows.map(mapper.fromRow);
  }

  async function getById(id: string): Promise<T | null> {
    const items = await list();
    return items.find((item) => item.id === id) ?? null;
  }

  async function create(item: T): Promise<T> {
    await appendRow(sheetName, mapper.toRow(item));
    return item;
  }

  async function update(id: string, patch: Partial<T>): Promise<T> {
    const found = await findRowIndexById(sheetName, id);
    if (!found) {
      throw new NotFoundError(`No record with id "${id}" was found in "${sheetName}".`);
    }

    const current = mapper.fromRow(found.row);
    const updated: T = { ...current, ...patch, id };
    await updateRowByRowNumber(sheetName, found.rowNumber, mapper.toRow(updated));
    return updated;
  }

  async function remove(id: string): Promise<void> {
    const found = await findRowIndexById(sheetName, id);
    if (!found) return;
    await deleteRowByRowNumber(sheetName, found.rowNumber);
  }

  return { list, getById, create, update, remove };
}
