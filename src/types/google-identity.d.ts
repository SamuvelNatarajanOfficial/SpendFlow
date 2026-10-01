/**
 * Minimal ambient types for the Google Identity Services script
 * (https://accounts.google.com/gsi/client), loaded at runtime — there is no
 * official npm package for the token-client API used here.
 */

export {};

declare global {
  interface GoogleTokenResponse {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
    error?: string;
    error_description?: string;
  }

  interface GoogleTokenClientErrorResponse {
    type: string;
    message?: string;
  }

  interface GoogleTokenClient {
    requestAccessToken(overrideConfig?: { prompt?: string }): void;
  }

  interface GoogleTokenClientConfig {
    client_id: string;
    scope: string;
    callback: (response: GoogleTokenResponse) => void;
    error_callback?: (error: GoogleTokenClientErrorResponse) => void;
  }

  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(config: GoogleTokenClientConfig): GoogleTokenClient;
          revoke(accessToken: string, callback?: () => void): void;
        };
      };
    };
  }
}
