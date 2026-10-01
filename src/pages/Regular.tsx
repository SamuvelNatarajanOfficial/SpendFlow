import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ExpenseList } from '../components/shared/ExpenseList';
import { AddExpenseModal } from '../components/shared/AddExpenseModal';
import { mockRegularExpenses } from '../data/mockData';

export function Regular() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Recurring monthly needs — rent, bills, groceries and more.
        </p>
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Add Expense
        </Button>
      </div>

      <ExpenseList
        expenses={mockRegularExpenses}
        emptyTitle="No regular expenses yet"
        emptyDescription="Add your recurring monthly needs to track them here."
      />

      <AddExpenseModal
        category="regular"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
