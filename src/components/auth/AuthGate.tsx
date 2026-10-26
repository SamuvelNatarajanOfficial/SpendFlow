import { useEffect, useState, type ReactNode } from 'react';
import { getSessionToken } from '../../services/localAuth';
import { authRepository } from '../../services/googleSheets/repositories/authRepository';
import { getFriendlyErrorMessage } from '../../services/googleSheets/errors';
import { LocalLoginScreen } from './LocalLoginScreen';
import { ConnectionErrorScreen } from './ConnectionErrorScreen';

export interface AuthGateProps {
  children: ReactNode;
}

type GateState =
  | { status: 'loading' }
  | { status: 'open' }
  | { status: 'locked' }
  | { status: 'error'; message: string };

/**
 * SpendFlow opens with no login by default. If the user enabled protection in
 * Settings (stored in the sheet's `Auth` tab), a username/password is asked
 * for first; the check itself happens in the Apps Script, not in the browser.
 */
export function AuthGate({ children }: AuthGateProps) {
  const [state, setState] = useState<GateState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    authRepository
      .isEnabled()
      .then((enabled) => {
        if (cancelled) return;
        const needsLogin = enabled && !getSessionToken();
        setState({ status: needsLogin ? 'locked' : 'open' });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ status: 'error', message: getFriendlyErrorMessage(error) });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  switch (state.status) {
    case 'loading':
      return null;
    case 'error':
      return (
        <ConnectionErrorScreen message={state.message} onRetry={() => window.location.reload()} />
      );
    case 'locked':
      return (
        <LocalLoginScreen
          onSubmit={async (username, password) => {
            const ok = await authRepository.login(username, password);
            if (ok) setState({ status: 'open' });
            return ok;
          }}
        />
      );
    case 'open':
      return <>{children}</>;
  }
}
