import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthGate } from './AuthGate';

const isEnabled = vi.fn();
const login = vi.fn();

vi.mock('../../services/googleSheets/repositories/authRepository', () => ({
  authRepository: {
    isEnabled: () => isEnabled(),
    login: (username: string, password: string) => login(username, password),
  },
}));

function renderGate() {
  return render(
    <AuthGate>
      <div>App content</div>
    </AuthGate>,
  );
}

describe('AuthGate', () => {
  beforeEach(() => {
    sessionStorage.clear();
    isEnabled.mockResolvedValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('opens the app with no login by default', async () => {
    renderGate();

    expect(await screen.findByText('App content')).toBeInTheDocument();
    expect(screen.queryByLabelText(/username/i)).not.toBeInTheDocument();
  });

  it('asks for a login when protection is enabled', async () => {
    isEnabled.mockResolvedValue(true);
    renderGate();

    expect(await screen.findByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.queryByText('App content')).not.toBeInTheDocument();
  });

  it('lets the user in once the server accepts the credentials', async () => {
    isEnabled.mockResolvedValue(true);
    login.mockResolvedValue(true);
    renderGate();

    await userEvent.type(await screen.findByLabelText(/username/i), 'admin');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(login).toHaveBeenCalledWith('admin', 'secret');
    expect(await screen.findByText('App content')).toBeInTheDocument();
  });

  it('rejects wrong credentials and stays on the login form', async () => {
    isEnabled.mockResolvedValue(true);
    login.mockResolvedValue(false);
    renderGate();

    await userEvent.type(await screen.findByLabelText(/username/i), 'admin');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText(/incorrect username or password/i)).toBeInTheDocument();
    expect(screen.queryByText('App content')).not.toBeInTheDocument();
  });

  it('skips the login again when this tab already has a session token', async () => {
    isEnabled.mockResolvedValue(true);
    sessionStorage.setItem('spendflow.session_token', 'tok');
    renderGate();

    expect(await screen.findByText('App content')).toBeInTheDocument();
  });

  it('shows a retry screen rather than the app if the script cannot be reached', async () => {
    isEnabled.mockRejectedValue(new Error('boom'));
    renderGate();

    expect(await screen.findByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.queryByText('App content')).not.toBeInTheDocument();
  });
});
