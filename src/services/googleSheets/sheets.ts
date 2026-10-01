import { apiGet, apiPost, apiPut } from './client';
import { MissingSheetError } from './errors';

interface ValuesResponse {
  values?: string[][];
}

interface SpreadsheetMeta {
  sheets: { properties: { sheetId: number; title: string } }[];
}

export interface SheetRows {
  headers: string[];
  rows: string[][];
}

export interface RowLookup {
  rowNumber: number;
  row: string[];
}

let spreadsheetMetaCache: Promise<SpreadsheetMeta> | null = null;

function getSpreadsheetMeta(): Promise<SpreadsheetMeta> {
  spreadsheetMetaCache ??= apiGet<SpreadsheetMeta>('');
  return spreadsheetMetaCache;
}

/** Call after any out-of-band change to the spreadsheet's tab structure. */
export function clearSpreadsheetMetaCache(): void {
  spreadsheetMetaCache = null;
}

async function getSheetIdByName(sheetName: string): Promise<number> {
  const meta = await getSpreadsheetMeta();
  const sheet = meta.sheets.find((candidate) => candidate.properties.title === sheetName);
  if (!sheet) {
    throw new MissingSheetError(
      `The "${sheetName}" tab was not found in the spreadsheet. Check your setup against docs/GOOGLE_SHEETS_SETUP.md.`,
    );
  }
  return sheet.properties.sheetId;
}

/** Converts a 1-based column count to its spreadsheet column letter (1 -> A, 27 -> AA). */
export function columnLetter(count: number): string {
  let n = count;
  let letters = '';
  while (n > 0) {
    const remainder = (n - 1) % 26;
    letters = String.fromCharCode(65 + remainder) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters || 'A';
}

export async function getSheetRows(sheetName: string): Promise<SheetRows> {
  const data = await apiGet<ValuesResponse>(`/values/${encodeURIComponent(sheetName)}`);
  const values = data.values ?? [];
  const [headers = [], ...rows] = values;
  const nonEmptyRows = rows.filter((row) => row.some((cell) => cell !== ''));
  return { headers, rows: nonEmptyRows };
}

export async function appendRow(sheetName: string, row: string[]): Promise<void> {
  const range = encodeURIComponent(sheetName);
  await apiPost(
    `/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    { values: [row] },
  );
}

export async function updateRowByRowNumber(
  sheetName: string,
  rowNumber: number,
  row: string[],
): Promise<void> {
  const lastColumn = columnLetter(row.length);
  const range = encodeURIComponent(
    `${sheetName}!A${rowNumber}:${lastColumn}${rowNumber}`,
  );
  await apiPut(`/values/${range}?valueInputOption=USER_ENTERED`, { values: [row] });
}

export async function deleteRowByRowNumber(
  sheetName: string,
  rowNumber: number,
): Promise<void> {
  const sheetId = await getSheetIdByName(sheetName);
  const startIndex = rowNumber - 1;
  await apiPost(':batchUpdate', {
    requests: [
      {
        deleteDimension: {
          range: { sheetId, dimension: 'ROWS', startIndex, endIndex: startIndex + 1 },
        },
      },
    ],
  });
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
