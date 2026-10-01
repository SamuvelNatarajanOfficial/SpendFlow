import { createRowMapper, column, cell, parseCell } from '../rowMapper';
import { createSheetRepository } from '../repositoryFactory';
import type { RegularPreset } from '../../../types/sheets';

const SHEET_NAME = 'RegularPresets';

const mapper = createRowMapper<RegularPreset>([
  column('id', 'Id', cell.string, parseCell.string),
  column('name', 'Name', cell.string, parseCell.string),
  column('defaultAmount', 'DefaultAmount', cell.number, parseCell.number),
  column('sortOrder', 'SortOrder', cell.number, parseCell.number),
  column('active', 'Active', cell.boolean, parseCell.boolean),
  column('createdAt', 'CreatedAt', cell.string, parseCell.string),
  column('updatedAt', 'UpdatedAt', cell.string, parseCell.string),
]);

export const presetRepository = createSheetRepository<RegularPreset>({
  sheetName: SHEET_NAME,
  mapper,
});
