import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { authRepository } from '../../services/googleSheets/repositories/authRepository';
import { getFriendlyErrorMessage } from '../../services/googleSheets/errors';
import { createCredentials, markLocallyAuthenticated } from '../../services/localAuth';

type Notice = { kind: 'success' | 'error'; message: string } | null;

/** Lets the user opt in to a username/password lock, stored in the sheet's `Auth` tab. */
export function AppProtectionSection() {
  const [loaded, setLoaded] = useState(false);
  const [enabled, setEnabled] = useState(false);
  // Whether a password is already saved — lets the user change just the
  // username or toggle protection without retyping it.
  const [hasSavedPassword, setHasSavedPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    let cancelled = false;
    authRepository
      .get()
      .then((config) => {
        if (cancelled) return;
        setEnabled(config.enabled);
        setUsername(config.username);
        setHasSavedPassword(Boolean(config.passwordHash));
        setLoaded(true);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setNotice({ kind: 'error', message: getFriendlyErrorMessage(error) });
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    const trimmedUsername = username.trim();
    if (enabled && !trimmedUsername) {
      setNotice({ kind: 'error', message: 'Enter a username to turn protection on.' });
      return;
    }
    if (enabled && !password && !hasSavedPassword) {
      setNotice({ kind: 'error', message: 'Enter a password to turn protection on.' });
      return;
    }

    setSaving(true);
    try {
      const existing = await authRepository.get();
      const credentials = password
        ? await createCredentials(trimmedUsername, password)
        : { ...existing, username: trimmedUsername };
      await authRepository.save({ enabled, ...credentials });
      setPassword('');
      setHasSavedPassword(Boolean(credentials.passwordHash));
      // The person just configured this, so don't lock them out of the
      // session they're already in — the login applies from the next visit.
      if (enabled) markLocallyAuthenticated();
      setNotice({
        kind: 'success',
        message: enabled
          ? 'Protection is on. You will be asked to log in next time you open the app.'
          : 'Protection is off. The app opens without a login.',
      });
    } catch (error) {
      setNotice({ kind: 'error', message: getFriendlyErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-base font-semibold text-text">App Protection</h2>
      <p className="text-sm text-muted">
        Optionally ask for a username and password when the app opens. The username and a
        hashed password are saved in the <span className="font-medium">Auth</span> tab of your
        Google Sheet. Off by default.
      </p>
      <form onSubmit={(event) => void handleSave(event)} className="flex flex-col gap-4">
        <label className="flex items-center gap-2 text-sm font-medium text-text">
          <input
            type="checkbox"
            checked={enabled}
            disabled={!loaded || saving}
            onChange={(event) => setEnabled(event.target.checked)}
            className="size-4"
          />
          Enable username/password protection
        </label>
        {enabled && (
          <>
            <Input
              label="Username"
              autoComplete="off"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={saving}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder={hasSavedPassword ? 'Leave blank to keep the current password' : ''}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={saving}
            />
          </>
        )}
        <div className="flex items-center gap-3">
          <Button type="submit" variant="secondary" size="sm" disabled={!loaded || saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
          {notice && (
            <span
              className={`text-sm ${notice.kind === 'success' ? 'text-regular' : 'text-overdue'}`}
            >
              {notice.message}
            </span>
          )}
        </div>
      </form>
    </section>
  );
}
