import { mockMonths } from '../data/mockData';
import { ProgressBar } from '../components/shared/ProgressBar';
import { formatCurrency } from '../utils/currency';

export function Months() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        A month-by-month overview of salary, spending and completion.
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {mockMonths.map((month) => (
          <article
            key={month.id}
            className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-text">{month.label}</h2>
              <span className="text-sm font-medium text-muted">
                {formatCurrency(month.remaining)} left
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div className="flex flex-col gap-0.5">
                <dt className="text-muted">Salary</dt>
                <dd className="font-medium text-text">{formatCurrency(month.salary)}</dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-muted">Regular</dt>
                <dd className="font-medium text-regular">
                  {formatCurrency(month.regularTotal)}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-muted">Extra</dt>
                <dd className="font-medium text-extra">
                  {formatCurrency(month.extraTotal)}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-muted">Remaining</dt>
                <dd className="font-medium text-text">
                  {formatCurrency(month.remaining)}
                </dd>
              </div>
            </dl>

            <div className="flex flex-col gap-3">
              <ProgressBar
                label="Regular completion"
                value={month.regularCompletion}
                colorClassName="bg-regular"
              />
              <ProgressBar
                label="Extra completion"
                value={month.extraCompletion}
                colorClassName="bg-extra"
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
