import { useState, type ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authenticateLocally, isLocallyAuthenticated } from '../../services/localAuth';
import { SignInScreen } from './SignInScreen';
import { LocalLoginScreen } from './LocalLoginScreen';
import { AccessDeniedScreen } from './AccessDeniedScreen';
import { ConnectionErrorScreen } from './ConnectionErrorScreen';

export interface AuthGateProps {
  children: ReactNode;
}

/**
 * Gates the whole app behind two steps: a static username/password check
 * (env-var based — there's no backend to hold real accounts), then Google
 * sign-in and the single-user allow-list, which is what actually grants
 * Google Sheets access.
 */
export function AuthGate({ children }: AuthGateProps) {
  const [locallyAuthenticated, setLocallyAuthenticated] = useState(isLocallyAuthenticated);
  const { status, email, error, signIn, signOut } = useAuth();

  if (!locallyAuthenticated) {
    return (
      <LocalLoginScreen
        onSubmit={(username, password) => {
          const ok = authenticateLocally(username, password);
          if (ok) setLocallyAuthenticated(true);
          return ok;
        }}
      />
    );
  }

  switch (status) {
    case 'idle':
      return null;
    case 'signed-out':
    case 'authenticating':
      return (
        <SignInScreen
          onSignIn={signIn}
          error={error}
          isAuthenticating={status === 'authenticating'}
        />
      );
    case 'denied':
      return <AccessDeniedScreen email={email} onSignOut={signOut} />;
    case 'error':
      return (
        <ConnectionErrorScreen
          message={error ?? 'Something went wrong while connecting to Google.'}
          onRetry={() => window.location.reload()}
        />
      );
    case 'authorized':
      return <>{children}</>;
  }
}
