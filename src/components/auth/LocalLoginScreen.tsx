import { useState, type FormEvent } from 'react';
import { Wallet } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export interface LocalLoginScreenProps {
  onSubmit: (username: string, password: string) => boolean;
}

export function LocalLoginScreen({ onSubmit }: LocalLoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ok = onSubmit(username, password);
    setError(ok ? null : 'Incorrect username or password.');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
        <Wallet className="size-7 text-primary" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-text">SpendFlow</h1>
        <p className="text-sm text-muted">Sign in to continue.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col gap-4 text-left">
        <Input
          label="Username"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoFocus
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button type="submit" size="lg">
          Log in
        </Button>
        {error && <p className="text-sm text-overdue">{error}</p>}
      </form>
    </div>
  );
}
