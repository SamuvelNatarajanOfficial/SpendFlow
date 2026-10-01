import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { MonthSelector } from '../components/dashboard/MonthSelector';
import { ExpenseList } from '../components/shared/ExpenseList';
import { EmptyState } from '../components/shared/EmptyState';
import { AddExtraItemModal } from '../components/shared/AddExtraItemModal';
import { Skeleton } from '../components/ui/Skeleton';
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
  const location = useLocation();
  const navigate = useNavigate();
  // The mobile bottom nav's central "Add" button navigates here with this
  // state flag so the form opens immediately instead of requiring a second
  // tap — read once, synchronously, as the initial state (no effect needed).
  const [isModalOpen, setIsModalOpen] = useState(() =>
    Boolean((location.state as { openAddModal?: boolean } | null)?.openAddModal),
  );
  const monthLabel = getMonthLabel(monthId);

  // Clear the one-shot nav state via `replace` so back/forward navigation
  // doesn't reopen the modal unexpectedly.
  useEffect(() => {
    if ((location.state as { openAddModal?: boolean } | null)?.openAddModal) {
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

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
        <Button size="md" onClick={() => setIsModalOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Add Extra
        </Button>
      </div>

      {isLoading && !data && (
        <div className="flex flex-col gap-2" aria-busy="true">
          <span className="sr-only">Loading…</span>
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      )}

      {error && (
        <EmptyState
          tone="error"
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
                size="md"
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
