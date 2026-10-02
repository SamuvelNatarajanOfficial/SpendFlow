import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('localAuth', () => {
  beforeEach(() => {
    vi.resetModules();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    sessionStorage.clear();
  });

  it('is not configured, and rejects any credentials, when the env vars are unset', async () => {
    vi.stubEnv('VITE_APP_USERNAME', '');
    vi.stubEnv('VITE_APP_PASSWORD', '');
    const { isLocalAuthConfigured, verifyLocalCredentials } = await import('./localAuth');

    expect(isLocalAuthConfigured()).toBe(false);
    expect(verifyLocalCredentials('anything', 'anything')).toBe(false);
  });

  it('accepts the exact configured username/password, trimming whitespace', async () => {
    vi.stubEnv('VITE_APP_USERNAME', 'admin');
    vi.stubEnv('VITE_APP_PASSWORD', 'hunter2');
    const { verifyLocalCredentials } = await import('./localAuth');

    expect(verifyLocalCredentials(' admin ', ' hunter2 ')).toBe(true);
  });

  it('rejects a wrong username or password', async () => {
    vi.stubEnv('VITE_APP_USERNAME', 'admin');
    vi.stubEnv('VITE_APP_PASSWORD', 'hunter2');
    const { verifyLocalCredentials } = await import('./localAuth');

    expect(verifyLocalCredentials('admin', 'wrong')).toBe(false);
    expect(verifyLocalCredentials('someone-else', 'hunter2')).toBe(false);
  });

  it('authenticateLocally persists success for the session and isLocallyAuthenticated reflects it', async () => {
    vi.stubEnv('VITE_APP_USERNAME', 'admin');
    vi.stubEnv('VITE_APP_PASSWORD', 'hunter2');
    const { authenticateLocally, isLocallyAuthenticated } = await import('./localAuth');

    expect(isLocallyAuthenticated()).toBe(false);
    expect(authenticateLocally('admin', 'hunter2')).toBe(true);
    expect(isLocallyAuthenticated()).toBe(true);
  });

  it('authenticateLocally does not persist anything on a failed attempt', async () => {
    vi.stubEnv('VITE_APP_USERNAME', 'admin');
    vi.stubEnv('VITE_APP_PASSWORD', 'hunter2');
    const { authenticateLocally, isLocallyAuthenticated } = await import('./localAuth');

    expect(authenticateLocally('admin', 'wrong')).toBe(false);
    expect(isLocallyAuthenticated()).toBe(false);
  });

  it('signOutLocally clears the persisted session', async () => {
    vi.stubEnv('VITE_APP_USERNAME', 'admin');
    vi.stubEnv('VITE_APP_PASSWORD', 'hunter2');
    const { authenticateLocally, isLocallyAuthenticated, signOutLocally } = await import(
      './localAuth'
    );

    authenticateLocally('admin', 'hunter2');
    expect(isLocallyAuthenticated()).toBe(true);

    signOutLocally();

    expect(isLocallyAuthenticated()).toBe(false);
  });
});
