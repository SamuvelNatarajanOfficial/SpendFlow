import { Wallet } from 'lucide-react';
import { Button } from '../ui/Button';

export interface SignInScreenProps {
  onSignIn: () => void;
  error?: string | null;
  isAuthenticating?: boolean;
}

export function SignInScreen({ onSignIn, error, isAuthenticating }: SignInScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
        <Wallet className="size-7 text-primary" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-text">SpendFlow</h1>
        <p className="text-sm text-muted">
          Sign in with the Google account linked to your spreadsheet.
        </p>
      </div>
      <Button onClick={onSignIn} disabled={isAuthenticating} size="lg">
        {isAuthenticating ? 'Connecting…' : 'Sign in with Google'}
      </Button>
      {error && <p className="max-w-xs text-sm text-overdue">{error}</p>}
    </div>
  );
}
