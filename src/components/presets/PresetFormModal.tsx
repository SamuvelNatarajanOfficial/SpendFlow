import { useState, type FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { CurrencyInput } from '../ui/CurrencyInput';
import { Button } from '../ui/Button';
import { getCurrentMonthId } from '../../services/financeEngine/month';
import type { PresetCategory, RegularPreset } from '../../types/sheets';
import type { PresetInput } from '../../services/financeEngine/monthService';

const categoryOptions: { value: PresetCategory; label: string }[] = [
  { value: 'HOME', label: 'Home' },
  { value: 'LOAN', label: 'Loan' },
  { value: 'BILL', label: 'Bill' },
  { value: 'FAMILY', label: 'Family' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'OTHER', label: 'Other' },
];

export interface PresetFormModalProps {
  isOpen: boolean;
  preset: RegularPreset | null;
  onClose: () => void;
  onSave: (input: PresetInput) => Promise<void>;
}

function toFormState(preset: RegularPreset | null) {
  return {
    name: preset?.name ?? '',
    category: preset?.category ?? 'HOME',
    amount: preset ? String(preset.amount) : '',
    startMonth: preset?.startMonth ?? getCurrentMonthId(),
    endMonth: preset?.endMonth ?? '',
    isIndefinite: preset ? preset.endMonth === null : true,
    dueDay: preset ? String(preset.dueDay) : '1',
    notes: preset?.notes ?? '',
  };
}

/**
 * The caller remounts this component (via a `key` tied to the preset's ID
 * and the open/close state) whenever it should show fresh form state — that
 * makes resetting on a new `preset` a plain lazy initializer instead of an
 * effect that calls setState on every change.
 */
export function PresetFormModal({
  isOpen,
  preset,
  onClose,
  onSave,
}: PresetFormModalProps) {
  const [form, setForm] = useState(() => toFormState(preset));
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(form.amount);
    const dueDay = Number(form.dueDay);
    if (!form.name.trim() || Number.isNaN(amount) || amount <= 0) return;
    if (Number.isNaN(dueDay) || dueDay < 1 || dueDay > 31) return;
    if (!form.isIndefinite && !form.endMonth) return;

    setIsSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        category: form.category,
        amount,
        startMonth: form.startMonth,
        endMonth: form.isIndefinite ? null : form.endMonth,
        dueDay,
        notes: form.notes,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={preset ? 'Edit Preset' : 'New Preset'}
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <Input
          label="Name"
          placeholder="e.g. Home Loan"
          value={form.name}
          onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
          required
          autoFocus
        />
        <Select
          label="Category"
          options={categoryOptions}
          value={form.category}
          onChange={(event) =>
            setForm((f) => ({ ...f, category: event.target.value as PresetCategory }))
          }
        />
        <CurrencyInput
          label="Monthly amount"
          placeholder="0"
          value={form.amount}
          onChange={(event) => setForm((f) => ({ ...f, amount: event.target.value }))}
          required
        />
        <Input
          label="Due day of month"
          type="number"
          min={1}
          max={31}
          value={form.dueDay}
          onChange={(event) => setForm((f) => ({ ...f, dueDay: event.target.value }))}
          required
        />
        <Input
          label="Start month"
          type="month"
          value={form.startMonth}
          onChange={(event) => setForm((f) => ({ ...f, startMonth: event.target.value }))}
          required
        />
        <label className="flex items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            checked={form.isIndefinite}
            onChange={(event) =>
              setForm((f) => ({ ...f, isIndefinite: event.target.checked }))
            }
            className="size-4 rounded border-border"
          />
          Continues indefinitely (no end month)
        </label>
        {!form.isIndefinite && (
          <Input
            label="End month"
            type="month"
            value={form.endMonth}
            onChange={(event) => setForm((f) => ({ ...f, endMonth: event.target.value }))}
            required
          />
        )}
        <Input
          label="Notes"
          placeholder="Optional"
          value={form.notes}
          onChange={(event) => setForm((f) => ({ ...f, notes: event.target.value }))}
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
