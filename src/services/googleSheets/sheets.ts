import { callScript } from './client';

export interface SheetRows {
  headers: string[];
  rows: string[][];
}

export interface RowLookup {
  rowNumber: number;
  row: string[];
}

export async function getSheetRows(sheetName: string): Promise<SheetRows> {
  const values = await callScript<string[][]>('getRows', { sheet: sheetName });
  const [headers = [], ...rows] = values;
  const nonEmptyRows = rows.filter((row) => row.some((cell) => cell !== ''));
  return { headers, rows: nonEmptyRows };
}

export async function appendRow(sheetName: string, row: string[]): Promise<void> {
  await callScript('appendRow', { sheet: sheetName, row });
}

/** Row numbers are 1-based and include the header row (data starts at row 2). */
export async function updateRowByRowNumber(
  sheetName: string,
  rowNumber: number,
  row: string[],
): Promise<void> {
  await callScript('updateRow', { sheet: sheetName, rowNumber, row });
}

export async function deleteRowByRowNumber(
  sheetName: string,
  rowNumber: number,
): Promise<void> {
  await callScript('deleteRow', { sheet: sheetName, rowNumber });
}

/** Row numbers are 1-based and include the header row (data starts at row 2). */
export async function findRowIndexById(
  sheetName: string,
  id: string,
): Promise<RowLookup | null> {
  const { rows } = await getSheetRows(sheetName);
  const index = rows.findIndex((row) => row[0] === id);
  if (index === -1) return null;
  return { rowNumber: index + 2, row: rows[index] };
}
