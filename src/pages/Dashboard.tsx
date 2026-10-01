import { useState } from 'react';
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  Clock,
  PiggyBank,
  Repeat,
  Sparkles,
} from 'lucide-react';
import { MonthSelector } from '../components/dashboard/MonthSelector';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { SalaryModal } from '../components/dashboard/SalaryModal';
import { ProgressBar } from '../components/shared/ProgressBar';
import { ExpenseList } from '../components/shared/ExpenseList';
import { EmptyState } from '../components/shared/EmptyState';
import { Button } from '../components/ui/Button';
import { useMonthNavigation } from '../hooks/useMonthNavigation';
import { useMonthData } from '../hooks/useMonthData';
import { getMonthLabel } from '../services/financeEngine/month';
import {
  markExtraItemPaid,
  markMonthlyItemPaid,
  setSalaryForMonth,
} from '../services/financeEngine/monthService';

export function Dashboard() {
  const { monthId, goToPrevious, goToNext } = useMonthNavigation();
  const { data, isLoading, error, reload } = useMonthData(monthId);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const monthLabel = getMonthLabel(monthId);

  async function handleMarkPaid(id: string, isExtra: boolean) {
    if (isExtra) {
      await markExtraItemPaid(id);
    } else {
      await markMonthlyItemPaid(id);
    }
    reload();
  }

  return (
    <div className="flex flex-col gap-6">
      <MonthSelector label={monthLabel} onPrevious={goToPrevious} onNext={goToNext} />

      {isLoading && !data && <p className="text-sm text-muted">Loading month…</p>}

      {error && (
        <EmptyState
          title="Couldn't load this month"
          description={error}
          action={<Button onClick={reload}>Retry</Button>}
        />
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <button
              type="button"
              className="w-full text-left"
              onClick={() => setIsSalaryModalOpen(true)}
            >
              <SummaryCard
                label="Salary (tap to edit)"
                amount={data.salary}
                icon={Banknote}
                tone="primary"
              />
            </button>
            <SummaryCard
              label="Regular Planned"
              amount={data.totals.regularTotal}
              icon={Repeat}
              tone="regular"
            />
            <SummaryCard
              label="Extra Planned"
              amount={data.totals.extraTotal}
              icon={Sparkles}
              tone="extra"
            />
            <SummaryCard
              label="Remaining"
              amount={data.totals.remainingBalance}
              icon={PiggyBank}
              tone="neutral"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Paid"
              amount={data.totals.paidRegularTotal + data.totals.paidExtraTotal}
              icon={CheckCircle2}
              tone="regular"
            />
            <SummaryCard
              label="Pending"
              amount={data.totals.pendingRegularTotal + data.totals.pendingExtraTotal}
              icon={Clock}
              tone="pending"
            />
            <SummaryCard
              label="Overdue"
              amount={data.totals.overdueTotal}
              icon={AlertCircle}
              tone="overdue"
            />
          </div>

          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-text">Completion</h2>
            <div className="flex flex-col gap-4">
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
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-text">Pending &amp; Overdue</h2>
            <ExpenseList
              items={[...data.regularItems, ...data.extraItems]
                .filter(
                  (item) =>
                    item.displayStatus === 'pending' || item.displayStatus === 'overdue',
                )
                .map((item) => ({
                  id: item.id,
                  name: item.name,
                  amount: item.amount,
                  dueDate: item.dueDate,
                  displayStatus: item.displayStatus,
                }))}
              emptyTitle="All caught up"
              emptyDescription="Nothing pending or overdue this month."
              renderAction={(item) => {
                const isExtra = data.extraItems.some((extra) => extra.id === item.id);
                return (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void handleMarkPaid(item.id, isExtra)}
                  >
                    Mark Paid
                  </Button>
                );
              }}
            />
          </section>

          <SalaryModal
            isOpen={isSalaryModalOpen}
            monthLabel={monthLabel}
            initialAmount={data.salary}
            onClose={() => setIsSalaryModalOpen(false)}
            onSave={async (amount) => {
              await setSalaryForMonth(monthId, amount);
              reload();
            }}
          />
        </>
      )}
    </div>
  );
}
