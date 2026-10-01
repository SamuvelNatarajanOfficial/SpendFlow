import { cn } from '../../utils/cn';

export interface ProgressBarProps {
  label: string;
  value: number;
  colorClassName?: string;
  className?: string;
}

export function ProgressBar({
  label,
  value,
  colorClassName = 'bg-primary',
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-text">{label}</span>
        <span className="font-medium text-muted">{clamped}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-full bg-border"
      >
        <div
          className={cn('h-full rounded-full transition-all', colorClassName)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
