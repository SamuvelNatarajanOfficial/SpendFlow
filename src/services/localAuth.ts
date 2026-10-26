/**
 * Session handling for the optional app protection. By default the app needs
 * no login. If the user turns on a username/password in Settings, the Apps
 * Script checks it (see authRepository) and hands back a short-lived session
 * token, kept here for the browser tab's session and sent with every request.
 */

const SESSION_KEY = 'spendflow.session_token';

export function getSessionToken(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function setSessionToken(token: string): void {
  try {
    sessionStorage.setItem(SESSION_KEY, token);
  } catch {
    // sessionStorage unavailable (e.g. a strict private-browsing mode) —
    // the login will simply be asked for again on the next load.
  }
}

export function clearSessionToken(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Nothing to clean up if storage was never reachable to begin with.
  }
}
