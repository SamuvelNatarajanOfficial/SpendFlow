import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { CurrencyInput } from '../ui/CurrencyInput';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import type { ExpenseCategory } from '../../types';

export interface AddExpenseModalProps {
  category: ExpenseCategory;
  isOpen: boolean;
  onClose: () => void;
}

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
];

export function AddExpenseModal({ category, isOpen, onClose }: AddExpenseModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category === 'regular' ? 'Add Regular Expense' : 'Add Extra Expense'}
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onClose();
        }}
      >
        <Input label="Name" placeholder="e.g. Electricity Bill" required />
        <CurrencyInput label="Amount" placeholder="0" required />
        <Select label="Status" options={statusOptions} defaultValue="pending" />
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
}
