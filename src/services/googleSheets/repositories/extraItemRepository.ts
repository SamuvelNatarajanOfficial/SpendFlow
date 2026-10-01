import { createRowMapper, column, cell, parseCell } from '../rowMapper';
import { createSheetRepository } from '../repositoryFactory';
import { getSheetRows } from '../sheets';
import type { ExtraItem } from '../../../types/sheets';

const SHEET_NAME = 'ExtraItems';

const mapper = createRowMapper<ExtraItem>([
  column('id', 'Id', cell.string, parseCell.string),
  column('monthId', 'MonthId', cell.string, parseCell.string),
  column('name', 'Name', cell.string, parseCell.string),
  column('amount', 'Amount', cell.number, parseCell.number),
  column('status', 'Status', cell.string, parseCell.status),
  column('dueDate', 'DueDate', cell.string, parseCell.string),
  column('paidDate', 'PaidDate', cell.string, parseCell.string),
  column('notes', 'Notes', cell.string, parseCell.string),
  column('createdAt', 'CreatedAt', cell.string, parseCell.string),
  column('updatedAt', 'UpdatedAt', cell.string, parseCell.string),
]);

const baseRepository = createSheetRepository<ExtraItem>({
  sheetName: SHEET_NAME,
  mapper,
});

async function listByMonth(monthId: string): Promise<ExtraItem[]> {
  const { rows } = await getSheetRows(SHEET_NAME);
  return rows.map(mapper.fromRow).filter((item) => item.monthId === monthId);
}

export const extraItemRepository = { ...baseRepository, listByMonth };
