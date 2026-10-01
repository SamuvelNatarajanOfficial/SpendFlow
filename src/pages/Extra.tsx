import { useState } from 'react';
import { Plus } from 'lucide-react';
import { MonthSelector } from '../components/dashboard/MonthSelector';
import { ExpenseList } from '../components/shared/ExpenseList';
import { EmptyState } from '../components/shared/EmptyState';
import { AddExtraItemModal } from '../components/shared/AddExtraItemModal';
import { Button } from '../components/ui/Button';
import { useMonthNavigation } from '../hooks/useMonthNavigation';
import { useMonthData } from '../hooks/useMonthData';
import { getMonthLabel } from '../services/financeEngine/month';
import {
  createExtraItem,
  markExtraItemPaid,
  markExtraItemPending,
} from '../services/financeEngine/monthService';

export function Extra() {
  const { monthId, goToPrevious, goToNext } = useMonthNavigation();
  const { data, isLoading, error, reload } = useMonthData(monthId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const monthLabel = getMonthLabel(monthId);

  async function toggle(id: string, isPaid: boolean) {
    if (isPaid) {
      await markExtraItemPending(id);
    } else {
      await markExtraItemPaid(id);
    }
    reload();
  }

  return (
    <div className="flex flex-col gap-4">
      <MonthSelector label={monthLabel} onPrevious={goToPrevious} onNext={goToNext} />

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          One-time and additional spending outside the regular budget.
        </p>
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Add Item
        </Button>
      </div>

      {isLoading && !data && <p className="text-sm text-muted">Loading…</p>}

      {error && (
        <EmptyState
          title="Couldn't load this month"
          description={error}
          action={<Button onClick={reload}>Retry</Button>}
        />
      )}

      {data && (
        <ExpenseList
          items={data.extraItems.map((item) => ({
            id: item.id,
            name: item.name,
            amount: item.amount,
            dueDate: item.dueDate,
            displayStatus: item.displayStatus,
          }))}
          emptyTitle="No extra items yet"
          emptyDescription="Add a one-time purchase to track it here."
          renderAction={(item) => {
            const sourceItem = data.extraItems.find(
              (candidate) => candidate.id === item.id,
            );
            const isPaid = sourceItem?.status === 'PAID';
            return (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => void toggle(item.id, Boolean(isPaid))}
              >
                {isPaid ? 'Mark Pending' : 'Mark Paid'}
              </Button>
            );
          }}
        />
      )}

      <AddExtraItemModal
        isOpen={isModalOpen}
        monthId={monthId}
        onClose={() => setIsModalOpen(false)}
        onCreate={async (input) => {
          await createExtraItem({ ...input, month: monthId });
          reload();
        }}
      />
    </div>
  );
}
