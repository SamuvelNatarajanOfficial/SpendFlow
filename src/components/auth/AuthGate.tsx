import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SignInScreen } from './SignInScreen';
import { AccessDeniedScreen } from './AccessDeniedScreen';
import { ConnectionErrorScreen } from './ConnectionErrorScreen';
import { ProtectionGate } from './ProtectionGate';

export interface AuthGateProps {
  children: ReactNode;
}

/**
 * Gates the app behind Google sign-in and the single-user allow-list, which is
 * what grants Google Sheets access. Once authorized, an optional
 * username/password lock (off by default, configured in Settings) may apply.
 */
export function AuthGate({ children }: AuthGateProps) {
  const { status, email, error, signIn, signOut } = useAuth();

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
      return <ProtectionGate>{children}</ProtectionGate>;
  }
}
