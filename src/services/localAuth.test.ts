import { afterEach, describe, expect, it } from 'vitest';
import { clearSessionToken, getSessionToken, setSessionToken } from './localAuth';

describe('localAuth session token', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('has no token until one is set, and forgets it when cleared', () => {
    expect(getSessionToken()).toBeNull();
    setSessionToken('abc');
    expect(getSessionToken()).toBe('abc');
    clearSessionToken();
    expect(getSessionToken()).toBeNull();
  });
});
