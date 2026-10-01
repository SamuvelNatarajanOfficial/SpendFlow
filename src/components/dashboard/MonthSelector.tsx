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
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3">
      <Button
        variant="ghost"
        size="sm"
        aria-label="Previous month"
        onClick={onPrevious}
        disabled={disablePrevious}
        className="h-9 w-9 p-0"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </Button>
      <span className="text-base font-semibold text-text">{label}</span>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Next month"
        onClick={onNext}
        disabled={disableNext}
        className="h-9 w-9 p-0"
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
