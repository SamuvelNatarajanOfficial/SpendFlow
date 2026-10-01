import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ExpenseList } from '../components/shared/ExpenseList';
import { AddExpenseModal } from '../components/shared/AddExpenseModal';
import { mockExtraExpenses } from '../data/mockData';

export function Extra() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          One-time and additional spending outside the regular budget.
        </p>
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Add Expense
        </Button>
      </div>

      <ExpenseList
        expenses={mockExtraExpenses}
        emptyTitle="No extra expenses yet"
        emptyDescription="Add a one-time purchase to track it here."
      />

      <AddExpenseModal
        category="extra"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
