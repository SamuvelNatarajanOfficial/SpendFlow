/**
 * Optional app protection. By default SpendFlow opens without any extra
 * login; the user can turn on a username/password in Settings, which is
 * stored in the `Auth` tab of their Google Sheet (see authRepository) and
 * checked after Google sign-in. Only a salted SHA-256 hash of the password is
 * ever stored. This is a local convenience lock, not a substitute for the
 * Google OAuth + allowed-email check that actually guards the data.
 */

const SESSION_KEY = 'spendflow.local_auth';

export interface StoredCredentials {
  username: string;
  passwordHash: string;
  salt: string;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function generateSalt(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(16)));
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toHex(new Uint8Array(digest));
}

export async function createCredentials(
  username: string,
  password: string,
): Promise<StoredCredentials> {
  const salt = generateSalt();
  return { username: username.trim(), salt, passwordHash: await hashPassword(password, salt) };
}

/** Checks the entered credentials against the stored ones, without changing any state. */
export async function verifyCredentials(
  stored: StoredCredentials,
  username: string,
  password: string,
): Promise<boolean> {
  if (username.trim() !== stored.username) return false;
  return (await hashPassword(password, stored.salt)) === stored.passwordHash;
}

export function isLocallyAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

/** Remembers a successful login for the browser tab's session. */
export function markLocallyAuthenticated(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, 'true');
  } catch {
    // sessionStorage unavailable (e.g. a strict private-browsing mode) —
    // the caller's own in-memory state still gates the current render.
  }
}

export function signOutLocally(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Nothing to clean up if storage was never reachable to begin with.
  }
}
