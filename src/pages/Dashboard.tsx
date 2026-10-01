import { useState } from 'react';
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  Clock,
  PiggyBank,
  Plus,
  Repeat,
  Sparkles,
} from 'lucide-react';
import { MonthSelector } from '../components/dashboard/MonthSelector';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { SalaryModal } from '../components/dashboard/SalaryModal';
import { SegmentedBar } from '../components/dashboard/SegmentedBar';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { ProgressBar } from '../components/shared/ProgressBar';
import { ExpenseList } from '../components/shared/ExpenseList';
import { EmptyState } from '../components/shared/EmptyState';
import { PresetCategoryBadge } from '../components/shared/PresetCategoryBadge';
import { AddExtraItemModal } from '../components/shared/AddExtraItemModal';
import { Button } from '../components/ui/Button';
import { useMonthNavigation } from '../hooks/useMonthNavigation';
import { useMonthData } from '../hooks/useMonthData';
import { getMonthLabel } from '../services/financeEngine/month';
import {
  createExtraItem,
  markExtraItemPaid,
  markExtraItemPending,
  markMonthlyItemPaid,
  markMonthlyItemPending,
  setSalaryForMonth,
} from '../services/financeEngine/monthService';
import { formatCurrency } from '../utils/currency';

export function Dashboard() {
  const { monthId, goToPrevious, goToNext } = useMonthNavigation();
  const { data, isLoading, error, reload } = useMonthData(monthId);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [isAddExtraOpen, setIsAddExtraOpen] = useState(false);
  const monthLabel = getMonthLabel(monthId);

  async function toggleRegular(id: string, isPaid: boolean) {
    if (isPaid) {
      await markMonthlyItemPending(id);
    } else {
      await markMonthlyItemPaid(id);
    }
    reload();
  }

  async function toggleExtra(id: string, isPaid: boolean) {
    if (isPaid) {
      await markExtraItemPending(id);
    } else {
      await markExtraItemPaid(id);
    }
    reload();
  }

  return (
    <div className="flex flex-col gap-6">
      <MonthSelector label={monthLabel} onPrevious={goToPrevious} onNext={goToNext} />

      {isLoading && !data && <DashboardSkeleton />}

      {error && (
        <EmptyState
          tone="error"
          title="Couldn't load this month"
          description={error}
          action={<Button onClick={reload}>Retry</Button>}
        />
      )}

      {data && (
        <>
          {/* Salary + top summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <button
              type="button"
              className="w-full rounded-xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={() => setIsSalaryModalOpen(true)}
              aria-label={
                data.salary > 0
                  ? `Salary ${formatCurrency(data.salary)}. Tap to edit.`
                  : 'No salary set for this month. Tap to set it.'
              }
            >
              <SummaryCard
                label="Salary"
                amount={data.salary}
                icon={Banknote}
                tone={data.salary > 0 ? 'primary' : 'pending'}
                subtext={data.salary > 0 ? 'Tap to edit' : 'Tap to set your salary'}
              />
            </button>
            <SummaryCard
              label="Regular Needs"
              amount={data.totals.regularTotal}
              icon={Repeat}
              tone="regular"
              subtext={`${data.totals.regularCompletionPercentage}% complete`}
            />
            <SummaryCard
              label="Extra"
              amount={data.totals.extraTotal}
              icon={Sparkles}
              tone="extra"
              subtext={`${data.totals.extraCompletionPercentage}% complete`}
            />
            <SummaryCard
              label="Remaining"
              amount={data.totals.remainingBalance}
              icon={PiggyBank}
              tone="neutral"
            />
          </div>

          {/* Paid / Pending / Overdue breakdown */}
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
              tone={data.totals.overdueTotal > 0 ? 'overdue' : 'neutral'}
            />
          </div>

          {/* Regular section */}
          <section className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-text">Regular Needs</h2>
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
                const source = data.regularItems.find(
                  (candidate) => candidate.id === item.id,
                );
                const isPaid = source?.status === 'PAID';
                return (
                  <Button
                    size="md"
                    variant="secondary"
                    onClick={() => void toggleRegular(item.id, Boolean(isPaid))}
                  >
                    {isPaid ? 'Mark Pending' : 'Mark Paid'}
                  </Button>
                );
              }}
            />
          </section>

          {/* Extra section */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-text">Extra</h2>
              <Button size="md" onClick={() => setIsAddExtraOpen(true)}>
                <Plus className="size-4" aria-hidden="true" />
                Add Extra
              </Button>
            </div>
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
                const source = data.extraItems.find(
                  (candidate) => candidate.id === item.id,
                );
                const isPaid = source?.status === 'PAID';
                return (
                  <Button
                    size="md"
                    variant="secondary"
                    onClick={() => void toggleExtra(item.id, Boolean(isPaid))}
                  >
                    {isPaid ? 'Mark Pending' : 'Mark Paid'}
                  </Button>
                );
              }}
            />
          </section>

          {/* Overdue section */}
          <section className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-overdue">
              Overdue / Still Not Completed
            </h2>
            {(() => {
              const overdueItems = [...data.regularItems, ...data.extraItems].filter(
                (item) => item.displayStatus === 'overdue',
              );

              if (overdueItems.length === 0) {
                return (
                  <EmptyState
                    tone="positive"
                    icon={CheckCircle2}
                    title="Nothing overdue"
                    description="You're all caught up for this month."
                  />
                );
              }

              return (
                <ExpenseList
                  items={overdueItems.map((item) => {
                    const regularSource = data.regularItems.find(
                      (candidate) => candidate.id === item.id,
                    );
                    return {
                      id: item.id,
                      name: item.name,
                      amount: item.amount,
                      dueDate: item.dueDate,
                      displayStatus: item.displayStatus,
                      categoryBadge: regularSource ? (
                        <PresetCategoryBadge category={regularSource.category} />
                      ) : undefined,
                    };
                  })}
                  renderAction={(item) => {
                    const isExtra = data.extraItems.some(
                      (candidate) => candidate.id === item.id,
                    );
                    return (
                      <Button
                        size="md"
                        variant="danger"
                        onClick={() =>
                          void (isExtra
                            ? toggleExtra(item.id, false)
                            : toggleRegular(item.id, false))
                        }
                      >
                        Mark Paid
                      </Button>
                    );
                  }}
                />
              );
            })()}
          </section>

          {/* Month completion */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-text">Month Completion</h2>
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
              <ProgressBar
                label="Overall completion"
                value={data.totals.completionPercentage}
                colorClassName="bg-primary"
              />
            </div>
          </section>

          {/* Month summary */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-2 text-base font-semibold text-text">Month Summary</h2>
            <dl className="flex flex-col divide-y divide-border">
              {[
                ['Salary', data.salary],
                ['Planned Regular', data.totals.regularTotal],
                ['Planned Extra', data.totals.extraTotal],
                ['Planned Total', data.totals.regularTotal + data.totals.extraTotal],
                ['Paid', data.totals.paidRegularTotal + data.totals.paidExtraTotal],
                [
                  'Pending',
                  data.totals.pendingRegularTotal + data.totals.pendingExtraTotal,
                ],
                ['Overdue', data.totals.overdueTotal],
                ['Remaining', data.totals.remainingBalance],
              ].map(([label, value]) => (
                <div
                  key={label as string}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <dt className="text-muted">{label}</dt>
                  <dd className="font-medium text-text">
                    {formatCurrency(value as number)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <SegmentedBar
                title="Planned Spending Breakdown"
                segments={[
                  {
                    label: 'Regular',
                    value: data.totals.regularTotal,
                    colorClassName: 'bg-regular',
                  },
                  {
                    label: 'Extra',
                    value: data.totals.extraTotal,
                    colorClassName: 'bg-extra',
                  },
                ]}
                emptyMessage="Nothing planned for this month yet."
              />
            </section>
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <SegmentedBar
                title="Completion"
                segments={[
                  {
                    label: 'Paid',
                    value: data.totals.paidRegularTotal + data.totals.paidExtraTotal,
                    colorClassName: 'bg-regular',
                  },
                  {
                    label: 'Pending',
                    value:
                      data.totals.pendingRegularTotal +
                      data.totals.pendingExtraTotal +
                      data.totals.overdueTotal,
                    colorClassName: 'bg-pending',
                  },
                ]}
                emptyMessage="Nothing planned for this month yet."
              />
            </section>
          </div>

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

          <AddExtraItemModal
            isOpen={isAddExtraOpen}
            monthId={monthId}
            onClose={() => setIsAddExtraOpen(false)}
            onCreate={async (input) => {
              await createExtraItem({ ...input, month: monthId });
              reload();
            }}
          />
        </>
      )}
    </div>
  );
}
