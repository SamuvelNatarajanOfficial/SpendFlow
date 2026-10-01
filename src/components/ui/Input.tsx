import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
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
        <input
          id={inputId}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            'h-10 rounded-lg border border-border bg-white px-3 text-sm text-text',
            'placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
            error && 'border-overdue focus:ring-overdue/40 focus:border-overdue',
            className,
          )}
          {...rest}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-overdue">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
