import { Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface FloatingActionButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

/** Mobile-only quick-add button — the inline button already covers tablet/desktop. */
export function FloatingActionButton({
  label,
  onClick,
  className,
}: FloatingActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'fixed bottom-20 right-4 z-30 flex size-14 items-center justify-center rounded-full',
        'bg-primary text-white shadow-lg transition-transform hover:scale-105 active:scale-95',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'md:hidden',
        className,
      )}
    >
      <Plus className="size-6" aria-hidden="true" />
    </button>
  );
}
