import { MonthSelector } from '../components/dashboard/MonthSelector';
import { ExpenseList } from '../components/shared/ExpenseList';
import { EmptyState } from '../components/shared/EmptyState';
import { PresetCategoryBadge } from '../components/shared/PresetCategoryBadge';
import { Skeleton } from '../components/ui/Skeleton';
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

      {isLoading && !data && (
        <div className="flex flex-col gap-2" aria-busy="true">
          <span className="sr-only">Loading…</span>
          {Array.from({ length: 4 }, (_, index) => (
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
          items={data.regularItems.map((item) => ({
            id: item.id,
            name: item.name,
            amount: item.amount,
            dueDate: item.dueDate,
            displayStatus: item.displayStatus,
            categoryBadge: <PresetCategoryBadge category={item.category} />,
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
    </div>
  );
}
