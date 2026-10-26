import { afterEach, describe, expect, it } from 'vitest';
import {
  createCredentials,
  hashPassword,
  isLocallyAuthenticated,
  markLocallyAuthenticated,
  signOutLocally,
  verifyCredentials,
} from './localAuth';

describe('localAuth', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('never stores the plain password, and salts each hash', async () => {
    const a = await createCredentials('admin', 'hunter2');
    const b = await createCredentials('admin', 'hunter2');

    expect(a.passwordHash).not.toContain('hunter2');
    expect(a.salt).not.toBe(b.salt);
    expect(a.passwordHash).not.toBe(b.passwordHash);
    expect(a.passwordHash).toBe(await hashPassword('hunter2', a.salt));
  });

  it('accepts the right username/password, trimming the username', async () => {
    const stored = await createCredentials(' admin ', 'hunter2');
    expect(stored.username).toBe('admin');
    expect(await verifyCredentials(stored, ' admin ', 'hunter2')).toBe(true);
  });

  it('rejects a wrong username or password', async () => {
    const stored = await createCredentials('admin', 'hunter2');
    expect(await verifyCredentials(stored, 'admin', 'wrong')).toBe(false);
    expect(await verifyCredentials(stored, 'someone-else', 'hunter2')).toBe(false);
  });

  it('remembers a login for the session until signed out', () => {
    expect(isLocallyAuthenticated()).toBe(false);
    markLocallyAuthenticated();
    expect(isLocallyAuthenticated()).toBe(true);
    signOutLocally();
    expect(isLocallyAuthenticated()).toBe(false);
  });
});
