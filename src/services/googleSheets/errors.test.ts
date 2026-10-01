import { describe, expect, it } from 'vitest';
import {
  getFriendlyErrorMessage,
  MalformedRowError,
  MissingSheetError,
  NetworkError,
  SessionExpiredError,
  UnauthorizedError,
} from './errors';

describe('getFriendlyErrorMessage', () => {
  it('returns the message for a known Sheets error', () => {
    expect(getFriendlyErrorMessage(new SessionExpiredError())).toMatch(
      /session has expired/i,
    );
  });

  it('returns the message for an UnauthorizedError', () => {
    expect(getFriendlyErrorMessage(new UnauthorizedError())).toMatch(/permission/i);
  });

  it('returns the message for a MissingSheetError', () => {
    expect(getFriendlyErrorMessage(new MissingSheetError('Tab "Foo" missing'))).toBe(
      'Tab "Foo" missing',
    );
  });

  it('returns the message for a NetworkError', () => {
    expect(getFriendlyErrorMessage(new NetworkError())).toMatch(/network/i);
  });

  it('returns the message for a plain Error', () => {
    expect(getFriendlyErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('falls back to a generic message for a non-Error value', () => {
    expect(getFriendlyErrorMessage('not an error')).toBe(
      'Something went wrong. Please try again.',
    );
  });

  it('preserves the cause chain for debugging', () => {
    const cause = new Error('root cause');
    const wrapped = new MalformedRowError('bad row', { cause });
    expect(wrapped.cause).toBe(cause);
  });
});
