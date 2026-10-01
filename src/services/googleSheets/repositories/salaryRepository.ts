import { createRowMapper, column, cell, parseCell } from '../rowMapper';
import { createSheetRepository } from '../repositoryFactory';
import { getSheetRows } from '../sheets';
import { generateId } from '../../../utils/id';
import type { Salary } from '../../../types/sheets';

const SHEET_NAME = 'Salary';

const mapper = createRowMapper<Salary>([
  column('id', 'Id', cell.string, parseCell.string),
  column('month', 'Month', cell.string, parseCell.string),
  column('amount', 'Amount', cell.number, parseCell.number),
  column('notes', 'Notes', cell.string, parseCell.string),
  column('createdAt', 'CreatedAt', cell.string, parseCell.string),
  column('updatedAt', 'UpdatedAt', cell.string, parseCell.string),
]);

const baseRepository = createSheetRepository<Salary>({ sheetName: SHEET_NAME, mapper });

async function listByMonth(month: string): Promise<Salary[]> {
  const { rows } = await getSheetRows(SHEET_NAME);
  return rows.map(mapper.fromRow).filter((salary) => salary.month === month);
}

/** Returns the most recently updated salary record for a month, if any. */
async function getByMonth(month: string): Promise<Salary | null> {
  const matches = await listByMonth(month);
  if (matches.length === 0) return null;
  return matches.reduce((latest, candidate) =>
    candidate.updatedAt > latest.updatedAt ? candidate : latest,
  );
}

/** Creates a salary record for the month if none exists, otherwise updates it. */
async function upsertForMonth(month: string, amount: number): Promise<Salary> {
  const existing = await getByMonth(month);
  const now = new Date().toISOString();

  if (!existing) {
    const created: Salary = {
      id: generateId(),
      month,
      amount,
      notes: '',
      createdAt: now,
      updatedAt: now,
    };
    return baseRepository.create(created);
  }

  return baseRepository.update(existing.id, { amount, updatedAt: now });
}

export const salaryRepository = {
  ...baseRepository,
  listByMonth,
  getByMonth,
  upsertForMonth,
};
