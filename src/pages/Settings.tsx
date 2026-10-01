import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';

const currencyOptions = [{ value: 'INR', label: 'Indian Rupee (₹)' }];

export function Settings() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-base font-semibold text-text">Profile</h2>
        <Input label="Display name" placeholder="Your name" disabled />
        <Input label="Email" placeholder="you@example.com" disabled />
        <p className="text-sm text-muted">
          Google account sign-in will be connected in a later phase.
        </p>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-base font-semibold text-text">Preferences</h2>
        <Select label="Currency" options={currencyOptions} disabled />
        <p className="text-sm text-muted">
          Google Sheets sync and data export options will appear here once connected.
        </p>
      </section>

      <div>
        <Button variant="secondary" disabled>
          Connect Google Sheets
        </Button>
      </div>
    </div>
  );
}
