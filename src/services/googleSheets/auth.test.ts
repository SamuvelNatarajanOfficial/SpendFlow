import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const DEFAULT_CONFIG = {
  googleClientId: 'test-client-id',
  allowedGoogleEmail: 'me@example.com',
  googleOAuthScopes: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email',
};

// A mutable object (rather than per-test `vi.doMock`) so one test can change
// a value — e.g. an empty client ID — without leaking into later tests:
// `vi.resetModules()` clears the module *cache*, not a `vi.doMock` override,
// so a per-test `vi.doMock('./config', ...)` would otherwise keep replacing
// the config for every test that follows it.
const configState = vi.hoisted(() => ({
  googleClientId: 'test-client-id',
  allowedGoogleEmail: 'me@example.com',
  googleOAuthScopes: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email',
}));
vi.mock('./config', () => configState);

// `config.callback`/`config.error_callback` are declared `(response) => void`
// (see google-identity.d.ts) — auth.ts fires its internal async handling
// without returning it, so `await`ing the call itself only waits one
// microtask, not the full fetch()/json() chain inside. Flushing the
// microtask queue (a macrotask tick) after invoking one is what actually
// waits for that chain to finish.
async function flushMicrotasks(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

interface FakeTokenClient {
  config: GoogleTokenClientConfig;
  requestAccessToken: ReturnType<typeof vi.fn>;
}

function installFakeGoogleIdentityServices(): {
  initTokenClient: ReturnType<typeof vi.fn>;
  revoke: ReturnType<typeof vi.fn>;
  getClient: () => FakeTokenClient;
} {
  let lastClient: FakeTokenClient | undefined;
  const revoke = vi.fn((_token: string, callback?: () => void) => callback?.());

  const initTokenClient = vi.fn((config: GoogleTokenClientConfig) => {
    const requestAccessToken = vi.fn();
    lastClient = { config, requestAccessToken };
    return { requestAccessToken } satisfies GoogleTokenClient;
  });

  window.google = { accounts: { oauth2: { initTokenClient, revoke } } };

  return {
    initTokenClient,
    revoke,
    getClient: () => {
      if (!lastClient) throw new Error('initTokenClient was never called');
      return lastClient;
    },
  };
}

describe('auth (Google Identity Services token client)', () => {
  beforeEach(() => {
    vi.resetModules();
    delete window.google;
  });

  afterEach(() => {
    Object.assign(configState, DEFAULT_CONFIG);
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    delete window.google;
  });

  it('reports an error and never requests a token when VITE_GOOGLE_CLIENT_ID is missing', async () => {
    configState.googleClientId = '';
    const gis = installFakeGoogleIdentityServices();
    const { initAuth, getAuthState } = await import('./auth');

    await initAuth();

    expect(getAuthState().status).toBe('error');
    expect(gis.initTokenClient).not.toHaveBeenCalled();
  });

  it('initializes the token client and starts signed-out', async () => {
    const gis = installFakeGoogleIdentityServices();
    const { initAuth, getAuthState } = await import('./auth');

    await initAuth();

    expect(gis.initTokenClient).toHaveBeenCalledWith(
      expect.objectContaining({
        client_id: 'test-client-id',
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email',
      }),
    );
    expect(getAuthState()).toEqual({ status: 'signed-out', email: null, error: null });
  });

  it('signIn requests a token once the client is ready', async () => {
    const gis = installFakeGoogleIdentityServices();
    const { initAuth, signIn, getAuthState } = await import('./auth');

    await initAuth();
    signIn();

    expect(getAuthState().status).toBe('authenticating');
    expect(gis.getClient().requestAccessToken).toHaveBeenCalledWith({ prompt: 'consent' });
  });

  it('signIn reports an error if called before the token client is ready', async () => {
    const { signIn, getAuthState } = await import('./auth');

    signIn();

    expect(getAuthState().status).toBe('error');
  });

  it('a successful token callback with an allow-listed email reaches authorized', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(200, { email: 'me@example.com' })),
    );
    const gis = installFakeGoogleIdentityServices();
    const { initAuth, getAuthState } = await import('./auth');
    await initAuth();

    gis.getClient().config.callback({
      access_token: 'test-token',
      expires_in: 3600,
      scope: 'scope',
      token_type: 'Bearer',
    });
    await flushMicrotasks();

    expect(getAuthState()).toEqual({
      status: 'authorized',
      email: 'me@example.com',
      error: null,
    });
  });

  it('a successful token callback with a non-allow-listed email is denied and the token is revoked', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(200, { email: 'someone-else@example.com' })),
    );
    const gis = installFakeGoogleIdentityServices();
    const { initAuth, getAuthState, getAccessToken } = await import('./auth');
    await initAuth();

    gis.getClient().config.callback({
      access_token: 'test-token',
      expires_in: 3600,
      scope: 'scope',
      token_type: 'Bearer',
    });
    await flushMicrotasks();

    expect(getAuthState()).toEqual({
      status: 'denied',
      email: 'someone-else@example.com',
      error: null,
    });
    expect(getAccessToken()).toBeNull();
    expect(gis.revoke).toHaveBeenCalledWith('test-token', expect.any(Function));
  });

  it('a token callback carrying an OAuth error surfaces it', async () => {
    const gis = installFakeGoogleIdentityServices();
    const { initAuth, getAuthState } = await import('./auth');
    await initAuth();

    gis.getClient().config.callback({
      access_token: '',
      expires_in: 0,
      scope: '',
      token_type: 'Bearer',
      error: 'access_denied',
      error_description: 'The user denied access.',
    });
    await flushMicrotasks();

    expect(getAuthState().status).toBe('error');
    expect(getAuthState().error).toBe('access_denied: The user denied access.');
  });

  it("the token client's error_callback (e.g. popup closed) returns to signed-out with the detail surfaced", async () => {
    const gis = installFakeGoogleIdentityServices();
    const { initAuth, getAuthState } = await import('./auth');
    await initAuth();

    gis.getClient().config.error_callback?.({ type: 'popup_closed', message: 'Popup window closed' });

    expect(getAuthState()).toEqual({
      status: 'signed-out',
      email: null,
      error: 'Google sign-in error (popup_closed): Popup window closed',
    });
  });

  it('signOut revokes the token and returns to signed-out', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(200, { email: 'me@example.com' })),
    );
    const gis = installFakeGoogleIdentityServices();
    const { initAuth, signOut, getAuthState, getAccessToken } = await import('./auth');
    await initAuth();
    gis.getClient().config.callback({
      access_token: 'test-token',
      expires_in: 3600,
      scope: 'scope',
      token_type: 'Bearer',
    });
    await flushMicrotasks();

    signOut();

    expect(getAccessToken()).toBeNull();
    expect(getAuthState()).toEqual({ status: 'signed-out', email: null, error: null });
    expect(gis.revoke).toHaveBeenCalledWith('test-token', expect.any(Function));
  });

  it('handleSessionExpired revokes the token and shows a session-expired message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(200, { email: 'me@example.com' })),
    );
    const gis = installFakeGoogleIdentityServices();
    const { initAuth, handleSessionExpired, getAuthState, getAccessToken } = await import('./auth');
    await initAuth();
    gis.getClient().config.callback({
      access_token: 'test-token',
      expires_in: 3600,
      scope: 'scope',
      token_type: 'Bearer',
    });
    await flushMicrotasks();

    handleSessionExpired();

    expect(getAccessToken()).toBeNull();
    expect(getAuthState()).toEqual({
      status: 'signed-out',
      email: null,
      error: 'Your session expired. Please sign in again.',
    });
  });
});
