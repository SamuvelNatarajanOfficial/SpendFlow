/**
 * A static username/password gate shown before Google sign-in, checked
 * against env vars rather than any server. This is not a substitute for the
 * Google OAuth + allow-listed-email check that actually authorizes Google
 * Sheets access — it's an extra local step in front of it, since there's no
 * backend to hold real user accounts.
 */

const APP_USERNAME = import.meta.env.VITE_APP_USERNAME ?? '';
const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD ?? '';

const SESSION_KEY = 'spendflow.local_auth';

export function isLocalAuthConfigured(): boolean {
  return Boolean(APP_USERNAME && APP_PASSWORD);
}

export function isLocallyAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

/** Checks the given credentials without changing any stored state. */
export function verifyLocalCredentials(username: string, password: string): boolean {
  if (!isLocalAuthConfigured()) return false;
  return username.trim() === APP_USERNAME.trim() && password.trim() === APP_PASSWORD.trim();
}

/** Checks the credentials and, if they match, remembers this for the browser tab's session. */
export function authenticateLocally(username: string, password: string): boolean {
  const matched = verifyLocalCredentials(username, password);
  if (matched) {
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch {
      // sessionStorage unavailable (e.g. a strict private-browsing mode) —
      // the caller's own in-memory state still gates the current render.
    }
  }
  return matched;
}

export function signOutLocally(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Nothing to clean up if storage was never reachable to begin with.
  }
}
