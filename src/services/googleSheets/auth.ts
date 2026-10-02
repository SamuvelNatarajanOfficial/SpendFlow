import { allowedGoogleEmail, googleClientId, googleOAuthScopes } from './config';
import { isAllowedEmail } from './authorization';

export type AuthStatus =
  | 'idle'
  | 'authenticating'
  | 'authorized'
  | 'denied'
  | 'signed-out'
  | 'error';

export interface AuthState {
  status: AuthStatus;
  email: string | null;
  error: string | null;
}

type Listener = (state: AuthState) => void;

/**
 * Authorization Code + PKCE, with a full-page redirect — not a popup.
 *
 * This app previously used Google Identity Services' popup-based token
 * client. That flow depends on the browser preserving a live window
 * reference between this page and the Google-hosted popup. In practice
 * that relationship kept breaking — even after this page was confirmed to
 * send a compatible Cross-Origin-Opener-Policy header *before* the button
 * was ever clickable — and every attempt reproduced GIS's own
 * `popup_closed` error despite sign-in visibly completing on Google's
 * side. That's a structural fragility in the popup-based approach itself
 * (also sensitive to third-party-cookie restrictions, extensions, and
 * browser-specific popup handling), not something to keep patching around.
 *
 * A redirect flow has no popup, no opener/popup relationship, and no
 * reliance on Google's own client-side script at all — just a top-level
 * navigation to Google and a direct HTTPS call to exchange the resulting
 * code for a token. PKCE (a random `code_verifier`/`code_challenge` pair)
 * lets a public client (no server, no client secret) do this safely.
 *
 * The access token still lives only in this module-level variable — never
 * localStorage/sessionStorage. The `code_verifier` kept in sessionStorage
 * across the redirect is not a credential — it's a single-use, random
 * value that authorizes nothing by itself and is deleted immediately after
 * the code exchange completes (standard OAuth PKCE practice for SPAs).
 */
let accessToken: string | null = null;

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

const PKCE_VERIFIER_KEY = 'spendflow.oauth.code_verifier';
const OAUTH_STATE_KEY = 'spendflow.oauth.state';

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateRandomString(byteLength: number): string {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(byteLength)));
}

async function sha256Base64Url(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return base64UrlEncode(new Uint8Array(digest));
}

/** The URL Google redirects back to — same page, without the hash route. */
function getRedirectUri(): string {
  return `${window.location.origin}${window.location.pathname}`;
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

interface GoogleTokenErrorBody {
  error?: string;
  error_description?: string;
}

async function exchangeCodeForToken(code: string, codeVerifier: string): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: googleClientId,
      code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: getRedirectUri(),
    }),
  });

  if (!response.ok) {
    const body: GoogleTokenErrorBody | null = await response.json().catch(() => null);
    throw new Error(
      body?.error_description ?? body?.error ?? `Google sign-in failed (${response.status}).`,
    );
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error('Google did not return an access token.');
  }

  return data.access_token;
}

function clearOAuthParamsFromUrl(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  url.searchParams.delete('state');
  url.searchParams.delete('scope');
  url.searchParams.delete('error');
  window.history.replaceState(window.history.state, '', url.toString());
}

function revokeCurrentToken(): void {
  if (accessToken) {
    const token = accessToken;
    // Best-effort — the token is discarded locally regardless of whether
    // this succeeds, so a failed/ignored revoke never blocks sign-out.
    fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, {
      method: 'POST',
    }).catch(() => {});
  }
  accessToken = null;
}

/**
 * Called once at startup. If this page load is Google redirecting back
 * with an authorization code, completes the sign-in; otherwise just
 * resolves the initial (signed-out) state.
 */
export async function initAuth(): Promise<void> {
  if (!googleClientId) {
    setState({
      status: 'error',
      error: 'Missing VITE_GOOGLE_CLIENT_ID. See .env.example for setup.',
    });
    return;
  }

  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  const oauthError = url.searchParams.get('error');

  if (oauthError) {
    clearOAuthParamsFromUrl();
    setState({ status: 'signed-out', error: `Google sign-in was cancelled (${oauthError}).` });
    return;
  }

  if (!code) {
    setState({ status: 'signed-out', email: null, error: null });
    return;
  }

  const returnedState = url.searchParams.get('state');
  const expectedState = sessionStorage.getItem(OAUTH_STATE_KEY);
  const codeVerifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);
  sessionStorage.removeItem(OAUTH_STATE_KEY);
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  clearOAuthParamsFromUrl();

  if (!codeVerifier || !expectedState || returnedState !== expectedState) {
    setState({
      status: 'error',
      error: "Google sign-in response couldn't be verified. Please try again.",
    });
    return;
  }

  setState({ status: 'authenticating', error: null });

  try {
    accessToken = await exchangeCodeForToken(code, codeVerifier);
    const email = await fetchAuthenticatedEmail(accessToken);

    if (!isAllowedEmail(email, allowedGoogleEmail)) {
      revokeCurrentToken();
      setState({ status: 'denied', email, error: null });
      return;
    }

    setState({ status: 'authorized', email, error: null });
  } catch (cause) {
    accessToken = null;
    setState({
      status: 'error',
      error: cause instanceof Error ? cause.message : 'Google sign-in failed.',
    });
  }
}

/** Redirects to Google's consent screen. Returns via a full page load, not a popup. */
export async function signIn(): Promise<void> {
  const codeVerifier = generateRandomString(32);
  const codeChallenge = await sha256Base64Url(codeVerifier);
  const oauthState = generateRandomString(16);

  sessionStorage.setItem(PKCE_VERIFIER_KEY, codeVerifier);
  sessionStorage.setItem(OAUTH_STATE_KEY, oauthState);

  const params = new URLSearchParams({
    client_id: googleClientId,
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: googleOAuthScopes,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state: oauthState,
    prompt: 'consent',
    access_type: 'online',
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
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
