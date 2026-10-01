import { Repeat, Sparkles } from 'lucide-react';
import type { ExpenseCategory } from '../../types';
import { cn } from '../../utils/cn';

export interface CategoryBadgeProps {
  category: ExpenseCategory;
  className?: string;
}

const categoryConfig: Record<
  ExpenseCategory,
  { label: string; icon: typeof Repeat; classes: string }
> = {
  regular: {
    label: 'Regular',
    icon: Repeat,
    classes: 'bg-regular/10 text-regular',
  },
  extra: {
    label: 'Extra',
    icon: Sparkles,
    classes: 'bg-extra/10 text-extra',
  },
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const { label, icon: Icon, classes } = categoryConfig[category];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
        classes,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
