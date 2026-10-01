import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { settingsRepository } from '../services/googleSheets/repositories/settingsRepository';
import { getFriendlyErrorMessage } from '../services/googleSheets/errors';

const currencyOptions = [{ value: 'INR', label: 'Indian Rupee (₹)' }];

type ConnectionTestState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'success' }
  | { status: 'error'; message: string };

export function Settings() {
  const { email, signOut } = useAuth();
  const [connectionTest, setConnectionTest] = useState<ConnectionTestState>({
    status: 'idle',
  });

  async function handleTestConnection() {
    setConnectionTest({ status: 'checking' });
    try {
      await settingsRepository.get();
      setConnectionTest({ status: 'success' });
    } catch (error) {
      setConnectionTest({ status: 'error', message: getFriendlyErrorMessage(error) });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-base font-semibold text-text">Google Account</h2>
        <p className="text-sm text-text">
          Signed in as <span className="font-medium">{email}</span>
        </p>
        <div>
          <Button variant="secondary" size="sm" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-base font-semibold text-text">Google Sheets Connection</h2>
        <p className="text-sm text-muted">
          Verify that SpendFlow can reach your spreadsheet and read the Settings tab.
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void handleTestConnection()}
            disabled={connectionTest.status === 'checking'}
          >
            {connectionTest.status === 'checking' ? 'Testing…' : 'Test Connection'}
          </Button>
          {connectionTest.status === 'success' && (
            <span className="inline-flex items-center gap-1.5 text-sm text-regular">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Connected
            </span>
          )}
          {connectionTest.status === 'error' && (
            <span className="inline-flex items-center gap-1.5 text-sm text-overdue">
              <XCircle className="size-4" aria-hidden="true" />
              {connectionTest.message}
            </span>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-base font-semibold text-text">Preferences</h2>
        <Select label="Currency" options={currencyOptions} disabled />
        <p className="text-sm text-muted">
          Currency and other preferences will become editable once monthly calculations
          are implemented.
        </p>
      </section>
    </div>
  );
}
