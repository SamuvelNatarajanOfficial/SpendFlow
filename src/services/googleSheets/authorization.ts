/**
 * Pure authorization guard: SpendFlow is single-user, so the signed-in
 * Google account's email must exactly match the configured allow-list email.
 */
export function isAllowedEmail(email: string, allowedEmail: string): boolean {
  if (!allowedEmail || !email) return false;
  return email.trim().toLowerCase() === allowedEmail.trim().toLowerCase();
}
