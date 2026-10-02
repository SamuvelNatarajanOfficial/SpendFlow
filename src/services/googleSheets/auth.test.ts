import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./config', () => ({
  googleClientId: 'test-client-id',
  allowedGoogleEmail: 'me@example.com',
  googleOAuthScopes: 'spreadsheets userinfo.email',
}));

function setUrl(url: string) {
  window.history.replaceState({}, '', url);
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('auth (redirect + PKCE flow)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    setUrl('/SpendFlow/');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('resolves to signed-out with no error when the URL carries no OAuth params', async () => {
    const { initAuth, getAuthState } = await import('./auth');
    await initAuth();
    expect(getAuthState()).toMatchObject({ status: 'signed-out', error: null });
  });

  it('surfaces a Google-side OAuth error from the URL and cleans it up', async () => {
    setUrl('/SpendFlow/?error=access_denied');
    const { initAuth, getAuthState } = await import('./auth');
    await initAuth();

    const result = getAuthState();
    expect(result.status).toBe('signed-out');
    expect(result.error).toMatch(/access_denied/);
    expect(window.location.search).toBe('');
  });

  it('rejects a returned code whose state does not match what signIn stored', async () => {
    sessionStorage.setItem('spendflow.oauth.state', 'expected-state');
    sessionStorage.setItem('spendflow.oauth.code_verifier', 'verifier');
    setUrl('/SpendFlow/?code=abc123&state=wrong-state');

    const { initAuth, getAuthState } = await import('./auth');
    await initAuth();

    expect(getAuthState().status).toBe('error');
    expect(getAuthState().error).toMatch(/verified/i);
  });

  it('rejects a returned code when no verifier/state was ever stored (e.g. direct link)', async () => {
    setUrl('/SpendFlow/?code=abc123&state=some-state');
    const { initAuth, getAuthState } = await import('./auth');
    await initAuth();
    expect(getAuthState().status).toBe('error');
  });

  it('exchanges a valid code, authorizes an allow-listed email, and cleans the URL', async () => {
    sessionStorage.setItem('spendflow.oauth.state', 'matching-state');
    sessionStorage.setItem('spendflow.oauth.code_verifier', 'verifier');
    setUrl('/SpendFlow/?code=abc123&state=matching-state');

    const fetchMock = vi.fn((url: string) => {
      if (url.includes('oauth2.googleapis.com/token')) {
        return Promise.resolve(jsonResponse(200, { access_token: 'token-123' }));
      }
      if (url.includes('userinfo')) {
        return Promise.resolve(jsonResponse(200, { email: 'me@example.com' }));
      }
      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    });
    vi.stubGlobal('fetch', fetchMock);

    const { initAuth, getAuthState, getAccessToken } = await import('./auth');
    await initAuth();

    expect(getAuthState()).toMatchObject({ status: 'authorized', email: 'me@example.com' });
    expect(getAccessToken()).toBe('token-123');
    expect(window.location.search).toBe('');
    expect(sessionStorage.getItem('spendflow.oauth.code_verifier')).toBeNull();
    expect(sessionStorage.getItem('spendflow.oauth.state')).toBeNull();
  });

  it('denies an authenticated email that is not on the allow-list', async () => {
    sessionStorage.setItem('spendflow.oauth.state', 'matching-state');
    sessionStorage.setItem('spendflow.oauth.code_verifier', 'verifier');
    setUrl('/SpendFlow/?code=abc123&state=matching-state');

    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        if (url.includes('oauth2.googleapis.com/token')) {
          return Promise.resolve(jsonResponse(200, { access_token: 'token-123' }));
        }
        if (url.includes('userinfo')) {
          return Promise.resolve(jsonResponse(200, { email: 'someone-else@example.com' }));
        }
        if (url.includes('revoke')) {
          return Promise.resolve(jsonResponse(200, {}));
        }
        return Promise.reject(new Error(`Unexpected fetch: ${url}`));
      }),
    );

    const { initAuth, getAuthState, getAccessToken } = await import('./auth');
    await initAuth();

    expect(getAuthState()).toMatchObject({
      status: 'denied',
      email: 'someone-else@example.com',
    });
    expect(getAccessToken()).toBeNull();
  });

  it('reports a friendly error when the token exchange itself fails', async () => {
    sessionStorage.setItem('spendflow.oauth.state', 'matching-state');
    sessionStorage.setItem('spendflow.oauth.code_verifier', 'verifier');
    setUrl('/SpendFlow/?code=abc123&state=matching-state');

    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          jsonResponse(400, { error: 'invalid_grant', error_description: 'Bad code' }),
        ),
      ),
    );

    const { initAuth, getAuthState } = await import('./auth');
    await initAuth();

    expect(getAuthState().status).toBe('error');
    expect(getAuthState().error).toMatch(/Bad code/);
  });

  it('signIn stores a PKCE verifier and state, and redirects to Google with a matching challenge', async () => {
    const { initAuth, signIn } = await import('./auth');
    await initAuth();

    // jsdom doesn't implement actual cross-origin navigation — assigning
    // `window.location.href` just logs "Not implemented" and leaves it
    // unchanged. Swap in a stub location that records the assignment
    // instead of relying on jsdom to follow it.
    const realLocation = window.location;
    let assignedHref = '';
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...realLocation,
        get href() {
          return assignedHref || realLocation.href;
        },
        set href(value: string) {
          assignedHref = value;
        },
      },
    });

    try {
      await signIn();
    } finally {
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: realLocation,
      });
    }

    const verifier = sessionStorage.getItem('spendflow.oauth.code_verifier');
    const oauthState = sessionStorage.getItem('spendflow.oauth.state');
    expect(verifier).toBeTruthy();
    expect(oauthState).toBeTruthy();

    const redirectUrl = new URL(assignedHref);
    expect(redirectUrl.origin + redirectUrl.pathname).toBe(
      'https://accounts.google.com/o/oauth2/v2/auth',
    );
    expect(redirectUrl.searchParams.get('client_id')).toBe('test-client-id');
    expect(redirectUrl.searchParams.get('response_type')).toBe('code');
    expect(redirectUrl.searchParams.get('code_challenge_method')).toBe('S256');
    expect(redirectUrl.searchParams.get('state')).toBe(oauthState);
    expect(redirectUrl.searchParams.get('code_challenge')).toBeTruthy();
  });

  it('signOut clears the access token and returns to signed-out', async () => {
    const { initAuth, signOut, getAuthState, getAccessToken } = await import('./auth');
    await initAuth();
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(jsonResponse(200, {}))));

    signOut();

    expect(getAccessToken()).toBeNull();
    expect(getAuthState().status).toBe('signed-out');
  });
});
