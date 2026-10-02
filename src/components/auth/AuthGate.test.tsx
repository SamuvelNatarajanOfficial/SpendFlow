import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { AuthContext, type AuthContextValue } from '../../context/AuthContext';
import { AuthGate } from './AuthGate';

const isLocallyAuthenticated = vi.fn();
const authenticateLocally = vi.fn();

vi.mock('../../services/localAuth', () => ({
  isLocallyAuthenticated: () => isLocallyAuthenticated(),
  authenticateLocally: (username: string, password: string) =>
    authenticateLocally(username, password),
}));

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
  signOutCompletely: vi.fn(),
};

describe('AuthGate', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('the static local login gate', () => {
    beforeEach(() => {
      isLocallyAuthenticated.mockReturnValue(false);
    });

    it('shows the login form before anything else, regardless of Google auth status', () => {
      renderWithAuth({ ...baseAuth, status: 'authorized', email: 'me@example.com' });

      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.queryByText('App content')).not.toBeInTheDocument();
    });

    it('moves past the gate once the entered credentials are accepted', async () => {
      authenticateLocally.mockReturnValue(true);
      renderWithAuth({ ...baseAuth, status: 'authorized', email: 'me@example.com' });

      await userEvent.type(screen.getByLabelText(/username/i), 'admin');
      await userEvent.type(screen.getByLabelText(/password/i), 'secret');
      await userEvent.click(screen.getByRole('button', { name: /log in/i }));

      expect(authenticateLocally).toHaveBeenCalledWith('admin', 'secret');
      expect(screen.getByText('App content')).toBeInTheDocument();
    });

    it('shows an error and stays on the login form when the credentials are rejected', async () => {
      authenticateLocally.mockReturnValue(false);
      renderWithAuth({ ...baseAuth, status: 'authorized' });

      await userEvent.type(screen.getByLabelText(/username/i), 'admin');
      await userEvent.type(screen.getByLabelText(/password/i), 'wrong');
      await userEvent.click(screen.getByRole('button', { name: /log in/i }));

      expect(screen.getByText(/incorrect username or password/i)).toBeInTheDocument();
      expect(screen.queryByText('App content')).not.toBeInTheDocument();
    });
  });

  describe('Google sign-in, once past the local gate', () => {
    beforeEach(() => {
      isLocallyAuthenticated.mockReturnValue(true);
    });

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
});
