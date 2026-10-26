import { callScript } from '../client';
import { setSessionToken } from '../../localAuth';

export interface ProtectionConfig {
  enabled: boolean;
  username: string;
  /** Whether a password is already saved — the password itself is never sent back. */
  hasPassword: boolean;
}

export interface ProtectionUpdate {
  enabled: boolean;
  username: string;
  /** Omit or leave empty to keep the saved password. */
  password?: string;
}

/** Whether a login is required. Public — answered before anyone has logged in. */
async function isEnabled(): Promise<boolean> {
  const { enabled } = await callScript<{ enabled: boolean }>('authStatus');
  return enabled;
}

/** Verifies the credentials on the server and, if they match, keeps the session token. */
async function login(username: string, password: string): Promise<boolean> {
  const result = await callScript<{ token: string | null }>('login', { username, password });
  if (!result.token) return false;
  setSessionToken(result.token);
  return true;
}

async function get(): Promise<ProtectionConfig> {
  return callScript<ProtectionConfig>('getAuth');
}

/**
 * Saves the protection settings to the sheet's `Auth` tab (created if missing).
 * Returns a fresh session token when protection is on, so the person who just
 * set it up isn't immediately locked out of the session they're in.
 */
async function save(update: ProtectionUpdate): Promise<void> {
  const result = await callScript<{ token: string | null }>('setAuth', { ...update });
  if (result.token) setSessionToken(result.token);
}

export const authRepository = { isEnabled, login, get, save };
