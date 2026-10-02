import { allowedGoogleEmail, googleClientId, googleOAuthScopes } from './config';
import { isAllowedEmail } from './authorization';

// DIAGNOSTIC (temporary): the error branches below log the raw GIS error
// object to the console and surface its `type`/`message` on screen, so a
// real failure can be identified precisely (e.g. "popup_closed" vs
// "popup_failed_to_open" vs an OAuth error) without needing to reproduce it
// alongside someone with DevTools access. None of this logs tokens, emails,
// or secrets — only Google's own error type/message strings. Safe to leave,
// but intended to be trimmed back to plain friendly copy once the root
// cause is confirmed from real output.

export type AuthStatus =
  'idle' | 'authenticating' | 'authorized' | 'denied' | 'signed-out' | 'error';

export interface AuthState {
  status: AuthStatus;
  email: string | null;
  error: string | null;
}

type Listener = (state: AuthState) => void;

/**
 * The access token lives only in this module-level variable — it is never
 * written to localStorage or sessionStorage. A page refresh clears it and
 * the user signs in again; that's an intentional trade-off for security.
 */
let accessToken: string | null = null;
let tokenClient: GoogleTokenClient | null = null;
let scriptLoadPromise: Promise<void> | null = null;

let state: AuthState = { status: 'idle', email: null, error: null };
const listeners = new Set<Listener>();

function setState(partial: Partial<AuthState>): void {
  state = { ...state, ...partial };
  listeners.forEach((listener) => listener(state));
}

export function getAuthState(): AuthState {
  return state;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAccessToken(): string | null {
  return accessToken;
}

function loadGisScript(): Promise<void> {
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services.'));
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

async function fetchAuthenticatedEmail(token: string): Promise<string> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Unable to retrieve your Google account email.');
  }

  const data = (await response.json()) as { email?: string };
  if (!data.email) {
    throw new Error('Google did not return an email address for this account.');
  }

  return data.email;
}

function revokeCurrentToken(): void {
  if (accessToken && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(accessToken, () => {});
  }
  accessToken = null;
}

async function handleTokenResponse(response: GoogleTokenResponse): Promise<void> {
  if (response.error) {
    console.error('[SpendFlow] Google token callback returned an error:', response);
    setState({
      status: 'error',
      error: `${response.error}: ${response.error_description ?? 'Google sign-in failed.'}`,
    });
    return;
  }

  accessToken = response.access_token;

  try {
    const email = await fetchAuthenticatedEmail(accessToken);

    if (!isAllowedEmail(email, allowedGoogleEmail)) {
      revokeCurrentToken();
      setState({ status: 'denied', email, error: null });
      return;
    }

    setState({ status: 'authorized', email, error: null });
  } catch (cause) {
    console.error('[SpendFlow] Error after receiving a token:', cause);
    revokeCurrentToken();
    setState({
      status: 'error',
      error: cause instanceof Error ? cause.message : 'Google sign-in failed.',
    });
  }
}

/** Loads the Google Identity Services script and prepares the token client. */
export async function initAuth(): Promise<void> {
  if (!googleClientId) {
    setState({
      status: 'error',
      error: 'Missing VITE_GOOGLE_CLIENT_ID. See .env.example for setup.',
    });
    return;
  }

  try {
    await loadGisScript();
  } catch (cause) {
    setState({
      status: 'error',
      error: cause instanceof Error ? cause.message : 'Failed to load Google sign-in.',
    });
    return;
  }

  if (!window.google?.accounts?.oauth2) {
    setState({ status: 'error', error: 'Google Identity Services failed to load.' });
    return;
  }

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: googleClientId,
    scope: googleOAuthScopes,
    callback: (response) => {
      void handleTokenResponse(response);
    },
    error_callback: (error) => {
      console.error('[SpendFlow] Google token client error_callback fired:', error);
      setState({
        status: 'signed-out',
        // Surfacing the raw `type` on screen (not just a generic fallback)
        // so we can tell exactly which GIS error this is without needing
        // DevTools open — e.g. "popup_closed" vs "popup_failed_to_open" vs
        // something else entirely point to very different root causes.
        error: `Google sign-in error (${error.type}): ${error.message ?? 'no message'}`,
      });
    },
  });

  setState({ status: 'signed-out', email: null, error: null });
}

export function signIn(): void {
  if (!tokenClient) {
    setState({
      status: 'error',
      error: 'Google sign-in is not ready yet. Please try again in a moment.',
    });
    return;
  }

  setState({ status: 'authenticating', error: null });
  tokenClient.requestAccessToken({ prompt: 'consent' });
}

export function signOut(): void {
  revokeCurrentToken();
  setState({ status: 'signed-out', email: null, error: null });
}

/** Called by the Sheets client when an API call reports an expired token. */
export function handleSessionExpired(): void {
  revokeCurrentToken();
  setState({
    status: 'signed-out',
    email: null,
    error: 'Your session expired. Please sign in again.',
  });
}
