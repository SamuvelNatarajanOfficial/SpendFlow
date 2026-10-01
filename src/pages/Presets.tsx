import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PresetCategoryBadge } from '../components/shared/PresetCategoryBadge';
import { EmptyState } from '../components/shared/EmptyState';
import { PresetFormModal } from '../components/presets/PresetFormModal';
import { formatCurrency } from '../utils/currency';
import { cn } from '../utils/cn';
import { getMonthLabel } from '../services/financeEngine/month';
import {
  createPreset,
  listPresets,
  setPresetActive,
  updatePreset,
  type PresetInput,
} from '../services/financeEngine/monthService';
import { getFriendlyErrorMessage } from '../services/googleSheets/errors';
import type { RegularPreset } from '../types/sheets';

export function Presets() {
  const [presets, setPresets] = useState<RegularPreset[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<RegularPreset | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    listPresets()
      .then((result) => {
        if (cancelled) return;
        setPresets(result);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(getFriendlyErrorMessage(cause));
      });

    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  function refresh() {
    setRefreshToken((token) => token + 1);
  }

  const visiblePresets = (presets ?? []).filter(
    (preset) => showInactive || preset.active,
  );

  function openCreate() {
    setEditingPreset(null);
    setIsModalOpen(true);
  }

  function openEdit(preset: RegularPreset) {
    setEditingPreset(preset);
    setIsModalOpen(true);
  }

  async function handleSave(input: PresetInput) {
    if (editingPreset) {
      await updatePreset(editingPreset.id, input);
    } else {
      await createPreset(input);
    }
    refresh();
  }

  async function handleToggleActive(preset: RegularPreset) {
    await setPresetActive(preset.id, !preset.active);
    refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Recurring presets that generate this month&apos;s regular items automatically.
        </p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          New Preset
        </Button>
      </div>

      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={showInactive}
          onChange={(event) => setShowInactive(event.target.checked)}
          className="size-4 rounded border-border"
        />
        Show inactive presets
      </label>

      {error && (
        <EmptyState
          title="Couldn't load presets"
          description={error}
          action={<Button onClick={refresh}>Retry</Button>}
        />
      )}

      {!error && presets === null && <p className="text-sm text-muted">Loading…</p>}

      {!error && presets !== null && visiblePresets.length === 0 && (
        <EmptyState
          title="No presets yet"
          description="Create a preset to automatically generate recurring regular items every month."
        />
      )}

      {!error && visiblePresets.length > 0 && (
        <ul className="flex flex-col gap-2">
          {visiblePresets.map((preset) => (
            <li
              key={preset.id}
              className={cn(
                'flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
                !preset.active && 'opacity-60',
              )}
            >
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-medium text-text">{preset.name}</span>
                  <PresetCategoryBadge category={preset.category} />
                  {!preset.active && (
                    <span className="text-xs font-medium text-muted">Inactive</span>
                  )}
                </div>
                <span className="text-xs text-muted">
                  {getMonthLabel(preset.startMonth)} –{' '}
                  {preset.endMonth ? getMonthLabel(preset.endMonth) : 'ongoing'} · due day{' '}
                  {preset.dueDay}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="font-medium text-text">
                  {formatCurrency(preset.amount)}
                </span>
                <Button size="sm" variant="secondary" onClick={() => openEdit(preset)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant={preset.active ? 'danger' : 'secondary'}
                  onClick={() => void handleToggleActive(preset)}
                >
                  {preset.active ? 'Deactivate' : 'Reactivate'}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <PresetFormModal
        key={isModalOpen ? (editingPreset?.id ?? 'new') : 'closed'}
        isOpen={isModalOpen}
        preset={editingPreset}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
