import { appsScriptUrl } from './config';
import { clearSessionToken, getSessionToken } from '../localAuth';
import {
  GoogleSheetsError,
  MissingSheetError,
  NetworkError,
  SessionExpiredError,
  SpreadsheetUnavailableError,
} from './errors';

interface ScriptResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * Calls one action on the Apps Script web app. The body is sent as plain
 * text (no custom headers) so the browser treats it as a "simple" request and
 * skips the CORS preflight, which Apps Script can't answer.
 */
export async function callScript<T>(
  action: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  if (!appsScriptUrl) {
    throw new SpreadsheetUnavailableError(
      'Missing VITE_APPS_SCRIPT_URL. See .env.example for setup.',
    );
  }

  let response: Response;
  try {
    response = await fetch(appsScriptUrl, {
      method: 'POST',
      body: JSON.stringify({ action, token: getSessionToken(), ...params }),
    });
  } catch (cause) {
    throw new NetworkError(undefined, { cause });
  }

  let body: ScriptResponse<T>;
  try {
    body = (await response.json()) as ScriptResponse<T>;
  } catch (cause) {
    throw new GoogleSheetsError(
      'The Apps Script returned an unexpected response. Check the deployment settings.',
      { cause },
    );
  }

  if (body.ok) return body.data as T;

  const message = body.error ?? 'The request failed.';
  switch (body.code) {
    case 'UNAUTHORIZED':
      clearSessionToken();
      throw new SessionExpiredError('Your session expired. Please log in again.');
    case 'MISSING_SHEET':
      throw new MissingSheetError(message);
    default:
      throw new GoogleSheetsError(message);
  }
}
