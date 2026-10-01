import { Car, Home, Landmark, MoreHorizontal, Receipt, Users } from 'lucide-react';
import type { PresetCategory } from '../../types/sheets';
import { cn } from '../../utils/cn';

export interface PresetCategoryBadgeProps {
  category: PresetCategory;
  className?: string;
}

/**
 * Neutral/grey across the board — colour in this app is reserved for
 * regular/extra/status communication, not preset sub-categories.
 */
const categoryConfig: Record<PresetCategory, { label: string; icon: typeof Home }> = {
  HOME: { label: 'Home', icon: Home },
  LOAN: { label: 'Loan', icon: Landmark },
  BILL: { label: 'Bill', icon: Receipt },
  FAMILY: { label: 'Family', icon: Users },
  TRANSPORT: { label: 'Transport', icon: Car },
  OTHER: { label: 'Other', icon: MoreHorizontal },
};

export function PresetCategoryBadge({ category, className }: PresetCategoryBadgeProps) {
  const { label, icon: Icon } = categoryConfig[category];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-muted',
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
