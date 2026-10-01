import { createRowMapper, column, cell, parseCell } from '../rowMapper';
import { createSheetRepository } from '../repositoryFactory';
import { getSheetRows } from '../sheets';
import type { Salary } from '../../../types/sheets';

const SHEET_NAME = 'Salary';

const mapper = createRowMapper<Salary>([
  column('id', 'Id', cell.string, parseCell.string),
  column('monthId', 'MonthId', cell.string, parseCell.string),
  column('amount', 'Amount', cell.number, parseCell.number),
  column('effectiveDate', 'EffectiveDate', cell.string, parseCell.string),
  column('notes', 'Notes', cell.string, parseCell.string),
  column('createdAt', 'CreatedAt', cell.string, parseCell.string),
  column('updatedAt', 'UpdatedAt', cell.string, parseCell.string),
]);

const baseRepository = createSheetRepository<Salary>({ sheetName: SHEET_NAME, mapper });

async function listByMonth(monthId: string): Promise<Salary[]> {
  const { rows } = await getSheetRows(SHEET_NAME);
  return rows.map(mapper.fromRow).filter((salary) => salary.monthId === monthId);
}

export const salaryRepository = { ...baseRepository, listByMonth };
