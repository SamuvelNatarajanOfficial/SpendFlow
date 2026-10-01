import { computeDueDate } from './month';
import { selectApplicablePresets } from './presetMatching';
import type { MonthlyItem, RegularPreset } from '../../types/sheets';

/**
 * Deterministic composite key — the same preset opened for the same month
 * always produces the same ID, so re-opening a month can detect "this
 * monthly item already exists" instead of creating a duplicate.
 */
export function buildMonthlyItemId(presetId: string, monthId: string): string {
  return `${presetId}__${monthId}`;
}

export function buildMonthlyItemFromPreset(
  preset: RegularPreset,
  monthId: string,
  now: string = new Date().toISOString(),
): MonthlyItem {
  return {
    id: buildMonthlyItemId(preset.id, monthId),
    month: monthId,
    presetId: preset.id,
    name: preset.name,
    category: preset.category,
    amount: preset.amount,
    status: 'PENDING',
    dueDate: computeDueDate(monthId, preset.dueDay),
    paidDate: '',
    notes: '',
    createdAt: now,
    updatedAt: now,
  };
}

export interface MonthlyItemReconciliation {
  /** Items already present in the sheet for this month — left untouched. */
  existing: MonthlyItem[];
  /** Newly materialized items the caller still needs to persist. */
  toCreate: MonthlyItem[];
}

/**
 * Figures out which applicable presets don't yet have a monthly item for
 * this month, without touching the network — callers persist `toCreate`
 * themselves (see financeEngine/monthService.ts).
 */
export function reconcileMonthlyItems(
  presets: RegularPreset[],
  existingItems: MonthlyItem[],
  monthId: string,
  now?: string,
): MonthlyItemReconciliation {
  const applicablePresets = selectApplicablePresets(presets, monthId);
  const existingIds = new Set(existingItems.map((item) => item.id));

  const toCreate = applicablePresets
    .filter((preset) => !existingIds.has(buildMonthlyItemId(preset.id, monthId)))
    .map((preset) => buildMonthlyItemFromPreset(preset, monthId, now));

  return { existing: existingItems, toCreate };
}
