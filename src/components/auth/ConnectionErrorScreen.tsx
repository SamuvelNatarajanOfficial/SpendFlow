import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ConnectionErrorScreenProps {
  message: string;
  onRetry: () => void;
}

export function ConnectionErrorScreen({ message, onRetry }: ConnectionErrorScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-pending/10">
        <AlertTriangle className="size-7 text-pending" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-text">
          Couldn&apos;t connect to Google
        </h1>
        <p className="max-w-sm text-sm text-muted">{message}</p>
      </div>
      <Button onClick={onRetry}>Try again</Button>
    </div>
  );
}
