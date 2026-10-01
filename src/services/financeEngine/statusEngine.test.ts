import { describe, expect, it } from 'vitest';
import { computeDisplayStatus } from './statusEngine';

describe('computeDisplayStatus', () => {
  it('always shows PAID as paid, regardless of due date', () => {
    const today = new Date(2027, 0, 20);
    expect(computeDisplayStatus('PAID', '2027-01-01', '2027-01', today)).toBe('paid');
    expect(computeDisplayStatus('PAID', '2027-01-31', '2027-01', today)).toBe('paid');
  });

  it('always shows SKIPPED as skipped', () => {
    const today = new Date(2027, 0, 20);
    expect(computeDisplayStatus('SKIPPED', '2027-01-01', '2027-01', today)).toBe(
      'skipped',
    );
  });

  it('shows PENDING as pending when today is before the due date', () => {
    const today = new Date(2027, 0, 10);
    expect(computeDisplayStatus('PENDING', '2027-01-20', '2027-01', today)).toBe(
      'pending',
    );
  });

  it('shows PENDING as pending when today equals the due date', () => {
    const today = new Date(2027, 0, 20);
    expect(computeDisplayStatus('PENDING', '2027-01-20', '2027-01', today)).toBe(
      'pending',
    );
  });

  it('shows PENDING as overdue once today is past the due date', () => {
    const today = new Date(2027, 0, 21);
    expect(computeDisplayStatus('PENDING', '2027-01-20', '2027-01', today)).toBe(
      'overdue',
    );
  });

  it("shows PENDING as overdue once the item's own month has fully elapsed", () => {
    const today = new Date(2027, 1, 1);
    expect(computeDisplayStatus('PENDING', '2027-01-20', '2027-01', today)).toBe(
      'overdue',
    );
  });

  it("does not mark a future month's pending item as overdue", () => {
    const today = new Date(2027, 0, 1);
    expect(computeDisplayStatus('PENDING', '2027-02-15', '2027-02', today)).toBe(
      'pending',
    );
  });
});
