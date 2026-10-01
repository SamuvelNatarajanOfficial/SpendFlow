import { createRowMapper, column, cell, parseCell } from '../rowMapper';
import { appendRow, getSheetRows, updateRowByRowNumber } from '../sheets';
import { generateId } from '../../../utils/id';
import type { Settings } from '../../../types/sheets';

const SHEET_NAME = 'Settings';

const mapper = createRowMapper<Settings>([
  column('id', 'Id', cell.string, parseCell.string),
  column('currency', 'Currency', cell.string, parseCell.string),
  column('monthStartDay', 'MonthStartDay', cell.number, parseCell.number),
  column('timezone', 'Timezone', cell.string, parseCell.string),
  column('createdAt', 'CreatedAt', cell.string, parseCell.string),
  column('updatedAt', 'UpdatedAt', cell.string, parseCell.string),
]);

/** The Settings tab holds exactly one data row — this is a singleton, not a list. */
async function get(): Promise<Settings | null> {
  const { rows } = await getSheetRows(SHEET_NAME);
  if (rows.length === 0) return null;
  return mapper.fromRow(rows[0]);
}

async function save(
  patch: Partial<Omit<Settings, 'id' | 'createdAt'>>,
): Promise<Settings> {
  const existing = await get();
  const now = new Date().toISOString();

  if (!existing) {
    const created: Settings = {
      id: generateId(),
      currency: 'INR',
      monthStartDay: 1,
      timezone: 'Asia/Kolkata',
      createdAt: now,
      updatedAt: now,
      ...patch,
    };
    await appendRow(SHEET_NAME, mapper.toRow(created));
    return created;
  }

  const updated: Settings = { ...existing, ...patch, updatedAt: now };
  await updateRowByRowNumber(SHEET_NAME, 2, mapper.toRow(updated));
  return updated;
}

export const settingsRepository = { get, save };
