import { createRowMapper, column, cell, parseCell } from '../rowMapper';
import { appendRow, getSheetRows } from '../sheets';
import { generateId } from '../../../utils/id';
import type { AuditEntry } from '../../../types/sheets';

const SHEET_NAME = 'Audit';

const mapper = createRowMapper<AuditEntry>([
  column('id', 'Id', cell.string, parseCell.string),
  column('timestamp', 'Timestamp', cell.string, parseCell.string),
  column('action', 'Action', cell.string, parseCell.string),
  column('entityType', 'EntityType', cell.string, parseCell.string),
  column('entityId', 'EntityId', cell.string, parseCell.string),
  column('details', 'Details', cell.string, parseCell.string),
]);

/** Audit entries are append-only — there is no update or delete. */
async function list(): Promise<AuditEntry[]> {
  const { rows } = await getSheetRows(SHEET_NAME);
  return rows.map(mapper.fromRow);
}

async function record(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<AuditEntry> {
  const fullEntry: AuditEntry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    ...entry,
  };
  await appendRow(SHEET_NAME, mapper.toRow(fullEntry));
  return fullEntry;
}

export const auditRepository = { list, record };
