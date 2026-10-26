/**
 * URL of the Google Apps Script web app that sits in front of the sheet
 * (see docs/apps-script/Code.gs). It reads/writes the sheet on the owner's
 * behalf, so the browser never needs a Google sign-in.
 */
export const appsScriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL ?? '';
