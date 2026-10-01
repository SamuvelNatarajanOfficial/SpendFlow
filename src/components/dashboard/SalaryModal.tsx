import { useState, type FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { CurrencyInput } from '../ui/CurrencyInput';
import { Button } from '../ui/Button';

export interface SalaryModalProps {
  isOpen: boolean;
  monthLabel: string;
  initialAmount: number;
  onClose: () => void;
  onSave: (amount: number) => Promise<void>;
}

export function SalaryModal({
  isOpen,
  monthLabel,
  initialAmount,
  onClose,
  onSave,
}: SalaryModalProps) {
  const [amount, setAmount] = useState(String(initialAmount || ''));
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = Number(amount);
    if (Number.isNaN(parsed) || parsed < 0) return;

    setIsSaving(true);
    try {
      await onSave(parsed);
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Salary — ${monthLabel}`}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <CurrencyInput
          label="Salary amount"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
          autoFocus
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
