export class GoogleSheetsError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'GoogleSheetsError';
  }
}

/** The caller has no valid access token, or the token lacks permission. */
export class UnauthorizedError extends GoogleSheetsError {
  constructor(
    message = 'You do not have permission to access this spreadsheet.',
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'UnauthorizedError';
  }
}

/** The access token was valid but has since expired or been revoked. */
export class SessionExpiredError extends GoogleSheetsError {
  constructor(
    message = 'Your Google session has expired. Please sign in again.',
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'SessionExpiredError';
  }
}

/** The spreadsheet itself could not be reached (bad ID, deleted, etc). */
export class SpreadsheetUnavailableError extends GoogleSheetsError {
  constructor(
    message = 'The spreadsheet is unavailable. Check the configured Google Sheet ID.',
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'SpreadsheetUnavailableError';
  }
}

/** A requested tab (e.g. "MonthlyItems") does not exist in the spreadsheet. */
export class MissingSheetError extends GoogleSheetsError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'MissingSheetError';
  }
}

/** A row's cell values didn't match the shape this app expects. */
export class MalformedRowError extends GoogleSheetsError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'MalformedRowError';
  }
}

/** The request never reached Google (offline, DNS failure, CORS, etc). */
export class NetworkError extends GoogleSheetsError {
  constructor(
    message = 'Network error. Check your internet connection and try again.',
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'NetworkError';
  }
}

/** A record with the given ID does not exist. */
export class NotFoundError extends GoogleSheetsError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'NotFoundError';
  }
}

/** Maps any error this service layer can throw to UI copy safe to display. */
export function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof GoogleSheetsError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}
