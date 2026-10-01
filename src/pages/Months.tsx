import { MonthSelector } from '../components/dashboard/MonthSelector';
import { ExpenseList } from '../components/shared/ExpenseList';
import { ProgressBar } from '../components/shared/ProgressBar';
import { EmptyState } from '../components/shared/EmptyState';
import { Button } from '../components/ui/Button';
import { useMonthNavigation } from '../hooks/useMonthNavigation';
import { useMonthData } from '../hooks/useMonthData';
import { getMonthLabel } from '../services/financeEngine/month';
import { formatCurrency } from '../utils/currency';

export function Months() {
  const { monthId, goToPrevious, goToNext } = useMonthNavigation();
  const { data, isLoading, error, reload } = useMonthData(monthId);
  const monthLabel = getMonthLabel(monthId);

  return (
    <div className="flex flex-col gap-4">
      <MonthSelector label={monthLabel} onPrevious={goToPrevious} onNext={goToNext} />
      <p className="text-sm text-muted">
        A full ledger for the selected month — past months stay accessible and are never
        deleted.
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
        <>
          <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div className="flex flex-col gap-0.5">
                <dt className="text-muted">Salary</dt>
                <dd className="font-medium text-text">{formatCurrency(data.salary)}</dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-muted">Regular</dt>
                <dd className="font-medium text-regular">
                  {formatCurrency(data.totals.regularTotal)}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-muted">Extra</dt>
                <dd className="font-medium text-extra">
                  {formatCurrency(data.totals.extraTotal)}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-muted">Remaining</dt>
                <dd className="font-medium text-text">
                  {formatCurrency(data.totals.remainingBalance)}
                </dd>
              </div>
            </dl>

            <div className="flex flex-col gap-3">
              <ProgressBar
                label="Regular completion"
                value={data.totals.regularCompletionPercentage}
                colorClassName="bg-regular"
              />
              <ProgressBar
                label="Extra completion"
                value={data.totals.extraCompletionPercentage}
                colorClassName="bg-extra"
              />
            </div>
          </article>

          <section className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-text">Regular Needs</h2>
            <ExpenseList
              items={data.regularItems.map((item) => ({
                id: item.id,
                name: item.name,
                amount: item.amount,
                dueDate: item.dueDate,
                displayStatus: item.displayStatus,
              }))}
              emptyTitle="No regular items this month"
              emptyDescription="Active presets will generate items here automatically."
            />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-text">Extra</h2>
            <ExpenseList
              items={data.extraItems.map((item) => ({
                id: item.id,
                name: item.name,
                amount: item.amount,
                dueDate: item.dueDate,
                displayStatus: item.displayStatus,
              }))}
              emptyTitle="No extra items this month"
              emptyDescription="Add one-time purchases from the Extra page."
            />
          </section>
        </>
      )}
    </div>
  );
}
