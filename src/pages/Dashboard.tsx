import { Banknote, PiggyBank, Repeat, Sparkles } from 'lucide-react';
import { MonthSelector } from '../components/dashboard/MonthSelector';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { ProgressBar } from '../components/shared/ProgressBar';
import { ExpenseList } from '../components/shared/ExpenseList';
import { useMonthNavigation } from '../hooks/useMonthNavigation';
import { mockExtraExpenses, mockRegularExpenses } from '../data/mockData';

export function Dashboard() {
  const { activeMonth, goToPrevious, goToNext, hasPrevious, hasNext } =
    useMonthNavigation();

  const pendingExpenses = [...mockRegularExpenses, ...mockExtraExpenses].filter(
    (expense) => expense.status !== 'paid',
  );

  return (
    <div className="flex flex-col gap-6">
      <MonthSelector
        label={activeMonth.label}
        onPrevious={goToPrevious}
        onNext={goToNext}
        disablePrevious={!hasPrevious}
        disableNext={!hasNext}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Salary"
          amount={activeMonth.salary}
          icon={Banknote}
          tone="primary"
        />
        <SummaryCard
          label="Regular Needs"
          amount={activeMonth.regularTotal}
          icon={Repeat}
          tone="regular"
        />
        <SummaryCard
          label="Extra"
          amount={activeMonth.extraTotal}
          icon={Sparkles}
          tone="extra"
        />
        <SummaryCard
          label="Remaining"
          amount={activeMonth.remaining}
          icon={PiggyBank}
          tone="neutral"
        />
      </div>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-text">Completion</h2>
        <div className="flex flex-col gap-4">
          <ProgressBar
            label="Regular completion"
            value={activeMonth.regularCompletion}
            colorClassName="bg-regular"
          />
          <ProgressBar
            label="Extra completion"
            value={activeMonth.extraCompletion}
            colorClassName="bg-extra"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-text">Pending &amp; Overdue</h2>
        <ExpenseList
          expenses={pendingExpenses}
          emptyTitle="All caught up"
          emptyDescription="Nothing pending or overdue this month."
        />
      </section>
    </div>
  );
}
