import { ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';

export interface AccessDeniedScreenProps {
  email: string | null;
  onSignOut: () => void;
}

export function AccessDeniedScreen({ email, onSignOut }: AccessDeniedScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-overdue/10">
        <ShieldAlert className="size-7 text-overdue" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-text">Access denied.</h1>
        <p className="text-base font-medium text-text">This application is private.</p>
        {email && (
          <p className="mt-2 text-sm text-muted">
            Signed in as <span className="font-medium text-text">{email}</span>, which
            isn&apos;t authorized to use this app.
          </p>
        )}
      </div>
      <Button variant="secondary" onClick={onSignOut}>
        Try a different account
      </Button>
    </div>
  );
}
