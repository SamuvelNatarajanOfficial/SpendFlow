import { MonthSelector } from '../components/dashboard/MonthSelector';
import { ExpenseList } from '../components/shared/ExpenseList';
import { EmptyState } from '../components/shared/EmptyState';
import { Button } from '../components/ui/Button';
import { useMonthNavigation } from '../hooks/useMonthNavigation';
import { useMonthData } from '../hooks/useMonthData';
import { getMonthLabel } from '../services/financeEngine/month';
import {
  markMonthlyItemPaid,
  markMonthlyItemPending,
} from '../services/financeEngine/monthService';

export function Regular() {
  const { monthId, goToPrevious, goToNext } = useMonthNavigation();
  const { data, isLoading, error, reload } = useMonthData(monthId);
  const monthLabel = getMonthLabel(monthId);

  async function toggle(id: string, isPaid: boolean) {
    if (isPaid) {
      await markMonthlyItemPending(id);
    } else {
      await markMonthlyItemPaid(id);
    }
    reload();
  }

  return (
    <div className="flex flex-col gap-4">
      <MonthSelector label={monthLabel} onPrevious={goToPrevious} onNext={goToNext} />
      <p className="text-sm text-muted">
        Recurring monthly needs, generated automatically from your active presets.
      </p>

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
          items={data.regularItems.map((item) => ({
            id: item.id,
            name: item.name,
            amount: item.amount,
            dueDate: item.dueDate,
            displayStatus: item.displayStatus,
          }))}
          emptyTitle="No regular items this month"
          emptyDescription="Create a preset on the Presets page to generate recurring items automatically."
          renderAction={(item) => {
            const sourceItem = data.regularItems.find(
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
    </div>
  );
}
