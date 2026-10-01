import { createRowMapper, column, cell, parseCell } from '../rowMapper';
import { createSheetRepository } from '../repositoryFactory';
import { getSheetRows } from '../sheets';
import type { MonthSummary } from '../../../types/sheets';

const SHEET_NAME = 'Months';

const mapper = createRowMapper<MonthSummary>([
  column('id', 'Id', cell.string, parseCell.string),
  column('year', 'Year', cell.number, parseCell.number),
  column('month', 'Month', cell.number, parseCell.number),
  column('label', 'Label', cell.string, parseCell.string),
  column('closed', 'Closed', cell.boolean, parseCell.boolean),
  column('createdAt', 'CreatedAt', cell.string, parseCell.string),
  column('updatedAt', 'UpdatedAt', cell.string, parseCell.string),
]);

const baseRepository = createSheetRepository<MonthSummary>({
  sheetName: SHEET_NAME,
  mapper,
});

async function getByYearMonth(year: number, month: number): Promise<MonthSummary | null> {
  const { rows } = await getSheetRows(SHEET_NAME);
  const match = rows
    .map(mapper.fromRow)
    .find((item) => item.year === year && item.month === month);
  return match ?? null;
}

export const monthRepository = { ...baseRepository, getByYearMonth };
