import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';

export interface MonthSelectorProps {
  label: string;
  onPrevious: () => void;
  onNext: () => void;
  disablePrevious?: boolean;
  disableNext?: boolean;
}

export function MonthSelector({
  label,
  onPrevious,
  onNext,
  disablePrevious,
  disableNext,
}: MonthSelectorProps) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-2 py-2 sm:gap-4 sm:px-4 sm:py-3">
      <Button
        variant="ghost"
        size="sm"
        aria-label="Previous month"
        onClick={onPrevious}
        disabled={disablePrevious}
        className="size-11 shrink-0 p-0"
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </Button>
      <span
        aria-live="polite"
        className="truncate text-sm font-semibold text-text sm:text-base"
      >
        {label}
      </span>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Next month"
        onClick={onNext}
        disabled={disableNext}
        className="size-11 shrink-0 p-0"
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </Button>
    </div>
  );
}
