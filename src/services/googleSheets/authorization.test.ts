import { describe, expect, it } from 'vitest';
import { isAllowedEmail } from './authorization';

describe('isAllowedEmail', () => {
  it('allows an exact match', () => {
    expect(isAllowedEmail('me@example.com', 'me@example.com')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(isAllowedEmail('Me@Example.com', 'me@example.com')).toBe(true);
  });

  it('ignores surrounding whitespace', () => {
    expect(isAllowedEmail('  me@example.com  ', 'me@example.com')).toBe(true);
  });

  it('denies a different email', () => {
    expect(isAllowedEmail('someone-else@example.com', 'me@example.com')).toBe(false);
  });

  it('denies when no allow-listed email is configured', () => {
    expect(isAllowedEmail('me@example.com', '')).toBe(false);
  });

  it('denies an empty authenticated email', () => {
    expect(isAllowedEmail('', 'me@example.com')).toBe(false);
  });
});
