import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const getAccessToken = vi.fn<() => string | null>();
const handleSessionExpired = vi.fn();

vi.mock('./config', () => ({ googleSheetId: 'test-sheet-id' }));
vi.mock('./auth', () => ({ getAccessToken, handleSessionExpired }));

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('googleSheets client', () => {
  beforeEach(() => {
    getAccessToken.mockReturnValue('test-token');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('throws UnauthorizedError when there is no access token', async () => {
    getAccessToken.mockReturnValue(null);
    const { apiGet } = await import('./client');
    const { UnauthorizedError } = await import('./errors');

    await expect(apiGet('/values/Settings')).rejects.toThrow(UnauthorizedError);
  });

  it('returns parsed JSON on a successful response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(200, { values: [['a', 'b']] })),
    );
    const { apiGet } = await import('./client');

    await expect(apiGet('/values/Settings')).resolves.toEqual({ values: [['a', 'b']] });
  });

  it('attaches the bearer token and spreadsheet ID to the request URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, {}));
    vi.stubGlobal('fetch', fetchMock);
    const { apiGet } = await import('./client');

    await apiGet('/values/Settings');

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      'https://sheets.googleapis.com/v4/spreadsheets/test-sheet-id/values/Settings',
    );
    expect((init.headers as Record<string, string>).Authorization).toBe(
      'Bearer test-token',
    );
  });

  it('triggers session-expiry handling and throws SessionExpiredError on 401', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(401, { error: { message: 'bad token' } })),
    );
    const { apiGet } = await import('./client');
    const { SessionExpiredError } = await import('./errors');

    await expect(apiGet('/values/Settings')).rejects.toThrow(SessionExpiredError);
    expect(handleSessionExpired).toHaveBeenCalledOnce();
  });

  it('throws UnauthorizedError on 403', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(403, { error: { message: 'forbidden' } })),
    );
    const { apiGet } = await import('./client');
    const { UnauthorizedError } = await import('./errors');

    await expect(apiGet('/values/Settings')).rejects.toThrow(UnauthorizedError);
  });

  it('throws SpreadsheetUnavailableError on 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(404, { error: { message: 'not found' } })),
    );
    const { apiGet } = await import('./client');
    const { SpreadsheetUnavailableError } = await import('./errors');

    await expect(apiGet('/values/Settings')).rejects.toThrow(SpreadsheetUnavailableError);
  });

  it('throws MissingSheetError when a tab range cannot be parsed', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse(400, { error: { message: 'Unable to parse range: Bogus!A1' } }),
        ),
    );
    const { apiGet } = await import('./client');
    const { MissingSheetError } = await import('./errors');

    await expect(apiGet('/values/Bogus')).rejects.toThrow(MissingSheetError);
  });

  it('throws NetworkError when fetch itself fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const { apiGet } = await import('./client');
    const { NetworkError } = await import('./errors');

    await expect(apiGet('/values/Settings')).rejects.toThrow(NetworkError);
  });
});
