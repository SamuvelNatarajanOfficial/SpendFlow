import { cn } from '../../utils/cn';
import { formatCurrency } from '../../utils/currency';
import { computeSharePercentages } from '../../utils/percentage';

export interface ChartSegment {
  label: string;
  value: number;
  /** Tailwind class applied to both the bar segment and its legend dot. */
  colorClassName: string;
}

export interface SegmentedBarProps {
  title: string;
  segments: ChartSegment[];
  emptyMessage?: string;
}

/**
 * A lightweight part-to-whole chart: a single stacked bar plus a text
 * legend. The legend is the sole accessible description (via the bar's own
 * `aria-label`) so screen reader users get one summary, not a duplicate.
 */
export function SegmentedBar({
  title,
  segments,
  emptyMessage = 'No data yet.',
}: SegmentedBarProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const percentages = computeSharePercentages(segments.map((segment) => segment.value));

  const summary = segments
    .map(
      (segment, index) =>
        `${segment.label} ${formatCurrency(segment.value)} (${percentages[index]}%)`,
    )
    .join(', ');

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-text">{title}</h3>

      {total <= 0 ? (
        <p className="text-sm text-muted">{emptyMessage}</p>
      ) : (
        <>
          <div
            role="img"
            aria-label={`${title}: ${summary}`}
            className="flex h-3 w-full overflow-hidden rounded-full bg-border"
          >
            {segments.map((segment, index) => {
              const width = (segment.value / total) * 100;
              if (width <= 0) return null;
              return (
                <div
                  key={segment.label}
                  style={{ width: `${width}%` }}
                  className={cn(
                    segment.colorClassName,
                    index > 0 && 'border-l-2 border-card',
                  )}
                />
              );
            })}
          </div>

          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm" aria-hidden="true">
            {segments.map((segment, index) => (
              <li key={segment.label} className="flex items-center gap-1.5">
                <span
                  className={cn('size-2.5 shrink-0 rounded-full', segment.colorClassName)}
                />
                <span className="text-muted">{segment.label}</span>
                <span className="font-medium text-text">
                  {formatCurrency(segment.value)}
                </span>
                <span className="text-muted">({percentages[index]}%)</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
