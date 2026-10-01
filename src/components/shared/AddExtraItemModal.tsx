import { useState, type FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { CurrencyInput } from '../ui/CurrencyInput';
import { Button } from '../ui/Button';

export interface AddExtraItemModalProps {
  isOpen: boolean;
  monthId: string;
  onClose: () => void;
  onCreate: (input: {
    name: string;
    amount: number;
    dueDate: string;
    notes: string;
  }) => Promise<void>;
}

export function AddExtraItemModal({
  isOpen,
  monthId,
  onClose,
  onCreate,
}: AddExtraItemModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(`${monthId}-01`);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  function reset() {
    setName('');
    setAmount('');
    setDueDate(`${monthId}-01`);
    setNotes('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!name.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0 || !dueDate)
      return;

    setIsSaving(true);
    try {
      await onCreate({ name: name.trim(), amount: parsedAmount, dueDate, notes });
      reset();
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Extra Item">
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <Input
          label="Name"
          placeholder="e.g. Weekend Trip"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          autoFocus
        />
        <CurrencyInput
          label="Amount"
          placeholder="0"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
        />
        <Input
          label="Due date"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          required
        />
        <Input
          label="Notes"
          placeholder="Optional"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
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
