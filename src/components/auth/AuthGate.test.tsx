import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { AuthContext, type AuthContextValue } from '../../context/AuthContext';
import { AuthGate } from './AuthGate';

function renderWithAuth(
  value: AuthContextValue,
  children: ReactNode = <div>App content</div>,
) {
  return render(
    <AuthContext.Provider value={value}>
      <AuthGate>{children}</AuthGate>
    </AuthContext.Provider>,
  );
}

const baseAuth: AuthContextValue = {
  status: 'signed-out',
  email: null,
  error: null,
  signIn: vi.fn(),
  signOut: vi.fn(),
};

describe('AuthGate', () => {
  it('shows a sign-in button when signed out', () => {
    renderWithAuth({ ...baseAuth, status: 'signed-out' });
    expect(
      screen.getByRole('button', { name: /sign in with google/i }),
    ).toBeInTheDocument();
  });

  it('calls signIn when the sign-in button is clicked', async () => {
    const signIn = vi.fn();
    renderWithAuth({ ...baseAuth, status: 'signed-out', signIn });

    await userEvent.click(screen.getByRole('button', { name: /sign in with google/i }));

    expect(signIn).toHaveBeenCalledOnce();
  });

  it('shows the exact access-denied copy for an unauthorized account', () => {
    renderWithAuth({
      ...baseAuth,
      status: 'denied',
      email: 'someone-else@example.com',
    });

    expect(screen.getByText('Access denied.')).toBeInTheDocument();
    expect(screen.getByText('This application is private.')).toBeInTheDocument();
    expect(screen.queryByText('App content')).not.toBeInTheDocument();
  });

  it('does not render the app for a denied user even if children are provided', () => {
    renderWithAuth({ ...baseAuth, status: 'denied', email: 'nope@example.com' });
    expect(screen.queryByText('App content')).not.toBeInTheDocument();
  });

  it('renders the app once authorized', () => {
    renderWithAuth({ ...baseAuth, status: 'authorized', email: 'me@example.com' });
    expect(screen.getByText('App content')).toBeInTheDocument();
  });

  it('shows a connection error screen with a retry action', () => {
    renderWithAuth({ ...baseAuth, status: 'error', error: 'Script failed to load.' });
    expect(screen.getByText('Script failed to load.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
