import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { AuthContext, type AuthContextValue } from '../../context/AuthContext';
import { createCredentials } from '../../services/localAuth';
import { PROTECTION_OFF } from '../../services/googleSheets/repositories/authRepository';
import { AuthGate } from './AuthGate';

const getAuthConfig = vi.fn();

vi.mock('../../services/googleSheets/repositories/authRepository', async (importOriginal) => ({
  ...(await importOriginal<
    typeof import('../../services/googleSheets/repositories/authRepository')
  >()),
  authRepository: { get: () => getAuthConfig(), save: vi.fn() },
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
  beforeEach(() => {
    sessionStorage.clear();
    getAuthConfig.mockResolvedValue(PROTECTION_OFF);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Google sign-in', () => {
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

    it('shows a connection error screen with a retry action', () => {
      renderWithAuth({ ...baseAuth, status: 'error', error: 'Script failed to load.' });
      expect(screen.getByText('Script failed to load.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  describe('optional username/password protection', () => {
    const authorized: AuthContextValue = {
      ...baseAuth,
      status: 'authorized',
      email: 'me@example.com',
    };

    it('opens the app with no login by default', async () => {
      renderWithAuth(authorized);

      expect(await screen.findByText('App content')).toBeInTheDocument();
      expect(screen.queryByLabelText(/username/i)).not.toBeInTheDocument();
    });

    it('asks for a login when protection is enabled in the sheet', async () => {
      getAuthConfig.mockResolvedValue({
        enabled: true,
        ...(await createCredentials('admin', 'secret')),
      });
      renderWithAuth(authorized);

      expect(await screen.findByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.queryByText('App content')).not.toBeInTheDocument();
    });

    it('lets the user in with the right credentials', async () => {
      getAuthConfig.mockResolvedValue({
        enabled: true,
        ...(await createCredentials('admin', 'secret')),
      });
      renderWithAuth(authorized);

      await userEvent.type(await screen.findByLabelText(/username/i), 'admin');
      await userEvent.type(screen.getByLabelText(/password/i), 'secret');
      await userEvent.click(screen.getByRole('button', { name: /log in/i }));

      expect(await screen.findByText('App content')).toBeInTheDocument();
    });

    it('rejects wrong credentials and stays on the login form', async () => {
      getAuthConfig.mockResolvedValue({
        enabled: true,
        ...(await createCredentials('admin', 'secret')),
      });
      renderWithAuth(authorized);

      await userEvent.type(await screen.findByLabelText(/username/i), 'admin');
      await userEvent.type(screen.getByLabelText(/password/i), 'wrong');
      await userEvent.click(screen.getByRole('button', { name: /log in/i }));

      expect(await screen.findByText(/incorrect username or password/i)).toBeInTheDocument();
      expect(screen.queryByText('App content')).not.toBeInTheDocument();
    });

    it('skips the login again within the same browser session', async () => {
      sessionStorage.setItem('spendflow.local_auth', 'true');
      getAuthConfig.mockResolvedValue({
        enabled: true,
        ...(await createCredentials('admin', 'secret')),
      });
      renderWithAuth(authorized);

      expect(await screen.findByText('App content')).toBeInTheDocument();
    });

    it('shows an error rather than opening the app if the Auth tab cannot be read', async () => {
      getAuthConfig.mockRejectedValue(new Error('boom'));
      renderWithAuth(authorized);

      expect(await screen.findByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.queryByText('App content')).not.toBeInTheDocument();
    });
  });
});
