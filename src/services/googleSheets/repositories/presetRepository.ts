import { createRowMapper, column, cell, parseCell } from '../rowMapper';
import { createSheetRepository } from '../repositoryFactory';
import type { RegularPreset } from '../../../types/sheets';

const SHEET_NAME = 'RegularPresets';

const mapper = createRowMapper<RegularPreset>([
  column('id', 'Id', cell.string, parseCell.string),
  column('name', 'Name', cell.string, parseCell.string),
  column('category', 'Category', cell.string, parseCell.presetCategory),
  column('amount', 'Amount', cell.number, parseCell.number),
  column('startMonth', 'StartMonth', cell.string, parseCell.string),
  column('endMonth', 'EndMonth', cell.nullableString, parseCell.nullableString),
  column('dueDay', 'DueDay', cell.number, parseCell.number),
  column('active', 'Active', cell.boolean, parseCell.boolean),
  column('notes', 'Notes', cell.string, parseCell.string),
  column('createdAt', 'CreatedAt', cell.string, parseCell.string),
  column('updatedAt', 'UpdatedAt', cell.string, parseCell.string),
]);

export const presetRepository = createSheetRepository<RegularPreset>({
  sheetName: SHEET_NAME,
  mapper,
});
