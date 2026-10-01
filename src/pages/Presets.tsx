import { Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CategoryBadge } from '../components/shared/CategoryBadge';
import { EmptyState } from '../components/shared/EmptyState';
import { mockPresets } from '../data/mockData';
import { formatCurrency } from '../utils/currency';

export function Presets() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Reusable templates for recurring expenses you add often.
        </p>
        <Button size="sm">
          <Plus className="size-4" aria-hidden="true" />
          New Preset
        </Button>
      </div>

      {mockPresets.length === 0 ? (
        <EmptyState
          title="No presets yet"
          description="Save a recurring expense as a preset to reuse it every month."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {mockPresets.map((preset) => (
            <li
              key={preset.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="truncate font-medium text-text">{preset.name}</span>
                <CategoryBadge category={preset.category} />
              </div>
              <span className="font-medium text-text">
                {formatCurrency(preset.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
