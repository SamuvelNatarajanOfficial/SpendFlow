import { googleSheetId } from './config';
import { getAccessToken, handleSessionExpired } from './auth';
import {
  GoogleSheetsError,
  MissingSheetError,
  NetworkError,
  SessionExpiredError,
  SpreadsheetUnavailableError,
  UnauthorizedError,
} from './errors';

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

interface GoogleApiErrorBody {
  error?: { code?: number; message?: string; status?: string };
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as GoogleApiErrorBody;
    return body.error?.message ?? response.statusText;
  } catch {
    return response.statusText || `HTTP ${response.status}`;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!googleSheetId) {
    throw new SpreadsheetUnavailableError(
      'Missing VITE_GOOGLE_SHEET_ID. See .env.example for setup.',
    );
  }

  const token = getAccessToken();
  if (!token) {
    throw new UnauthorizedError('You are not signed in.');
  }

  let response: Response;
  try {
    response = await fetch(`${SHEETS_API_BASE}/${googleSheetId}${path}`, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (cause) {
    throw new NetworkError(undefined, { cause });
  }

  if (response.ok) {
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  const message = await readErrorMessage(response);

  if (response.status === 401) {
    handleSessionExpired();
    throw new SessionExpiredError();
  }

  if (response.status === 403) {
    throw new UnauthorizedError(message);
  }

  if (response.status === 404) {
    throw new SpreadsheetUnavailableError(message);
  }

  if (response.status === 400 && /unable to parse range/i.test(message)) {
    throw new MissingSheetError(
      `A required sheet tab was not found (${message}). Check your spreadsheet setup.`,
    );
  }

  throw new GoogleSheetsError(message);
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' });
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export function apiPut<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
}
