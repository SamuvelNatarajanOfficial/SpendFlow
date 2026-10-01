export const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';
export const googleSheetId = import.meta.env.VITE_GOOGLE_SHEET_ID ?? '';
export const allowedGoogleEmail = import.meta.env.VITE_ALLOWED_GOOGLE_EMAIL ?? '';

/**
 * `spreadsheets` grants read/write access to the one sheet this app uses;
 * `userinfo.email` lets us read the signed-in address for the allow-list check.
 */
export const googleOAuthScopes = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');
