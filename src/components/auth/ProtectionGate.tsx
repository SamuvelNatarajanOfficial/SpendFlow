import { useEffect, useState, type ReactNode } from 'react';
import {
  isLocallyAuthenticated,
  markLocallyAuthenticated,
  verifyCredentials,
} from '../../services/localAuth';
import { authRepository, type AuthConfig } from '../../services/googleSheets/repositories/authRepository';
import { getFriendlyErrorMessage } from '../../services/googleSheets/errors';
import { LocalLoginScreen } from './LocalLoginScreen';
import { ConnectionErrorScreen } from './ConnectionErrorScreen';

type ProtectionState =
  | { status: 'loading' }
  | { status: 'open' }
  | { status: 'locked'; config: AuthConfig }
  | { status: 'error'; message: string };

/**
 * Optional username/password lock, shown after Google sign-in only when the
 * user enabled protection in Settings (stored in the sheet's `Auth` tab).
 * With protection off — the default — children render straight away.
 */
export function ProtectionGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProtectionState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    authRepository
      .get()
      .then((config) => {
        if (cancelled) return;
        const needsLogin = config.enabled && !isLocallyAuthenticated();
        setState(needsLogin ? { status: 'locked', config } : { status: 'open' });
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
    case 'locked': {
      const { config } = state;
      return (
        <LocalLoginScreen
          onSubmit={async (username, password) => {
            const ok = await verifyCredentials(config, username, password);
            if (ok) {
              markLocallyAuthenticated();
              setState({ status: 'open' });
            }
            return ok;
          }}
        />
      );
    }
    case 'open':
      return <>{children}</>;
  }
}
