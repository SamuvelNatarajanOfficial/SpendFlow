import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface CurrencyInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  label?: string;
  error?: string;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ label, error, id, className, ...rest }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text">
            {label}
          </label>
        )}
        <div className="relative">
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted"
            aria-hidden="true"
          >
            ₹
          </span>
          <input
            id={inputId}
            ref={ref}
            type="number"
            inputMode="decimal"
            min={0}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={cn(
              'h-10 w-full rounded-lg border border-border bg-white pl-7 pr-3 text-sm text-text',
              'placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
              error && 'border-overdue focus:ring-overdue/40 focus:border-overdue',
              className,
            )}
            {...rest}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-overdue">
            {error}
          </p>
        )}
      </div>
    );
  },
);

CurrencyInput.displayName = 'CurrencyInput';
