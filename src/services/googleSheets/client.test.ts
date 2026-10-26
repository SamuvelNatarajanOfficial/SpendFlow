import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe('callScript', () => {
  beforeEach(() => {
    vi.resetModules();
    sessionStorage.clear();
    vi.stubEnv('VITE_APPS_SCRIPT_URL', 'https://script.example/exec');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('posts the action as plain-text JSON and returns the data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true, data: [['a']] }));
    vi.stubGlobal('fetch', fetchMock);
    const { callScript } = await import('./client');

    await expect(callScript('getRows', { sheet: 'Salary' })).resolves.toEqual([['a']]);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://script.example/exec');
    expect(init.method).toBe('POST');
    // No custom headers — keeps it a "simple" request that skips CORS preflight.
    expect(init.headers).toBeUndefined();
    expect(JSON.parse(init.body)).toMatchObject({ action: 'getRows', sheet: 'Salary' });
  });

  it('sends the session token when there is one', async () => {
    sessionStorage.setItem('spendflow.session_token', 'tok');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true, data: null }));
    vi.stubGlobal('fetch', fetchMock);
    const { callScript } = await import('./client');

    await callScript('getRows');

    expect(JSON.parse(fetchMock.mock.calls[0][1].body).token).toBe('tok');
  });

  it('maps MISSING_SHEET to MissingSheetError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({ ok: false, code: 'MISSING_SHEET', error: 'no tab' }),
      ),
    );
    const { callScript } = await import('./client');
    const { MissingSheetError } = await import('./errors');

    await expect(callScript('getRows')).rejects.toThrow(MissingSheetError);
  });

  it('clears the session and throws SessionExpiredError on UNAUTHORIZED', async () => {
    sessionStorage.setItem('spendflow.session_token', 'old');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ ok: false, code: 'UNAUTHORIZED' })),
    );
    const { callScript } = await import('./client');
    const { SessionExpiredError } = await import('./errors');

    await expect(callScript('getRows')).rejects.toThrow(SessionExpiredError);
    expect(sessionStorage.getItem('spendflow.session_token')).toBeNull();
  });

  it('throws NetworkError when fetch itself fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    const { callScript } = await import('./client');
    const { NetworkError } = await import('./errors');

    await expect(callScript('getRows')).rejects.toThrow(NetworkError);
  });

  it('fails clearly when the URL is not configured', async () => {
    vi.stubEnv('VITE_APPS_SCRIPT_URL', '');
    const { callScript } = await import('./client');

    await expect(callScript('getRows')).rejects.toThrow(/VITE_APPS_SCRIPT_URL/);
  });
});
