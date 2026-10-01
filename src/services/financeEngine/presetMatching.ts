import { isMonthInRange } from './month';
import type { RegularPreset } from '../../types/sheets';

/** An inactive preset never applies, regardless of its date range. */
export function isPresetApplicable(preset: RegularPreset, monthId: string): boolean {
  return preset.active && isMonthInRange(monthId, preset.startMonth, preset.endMonth);
}

export function selectApplicablePresets(
  presets: RegularPreset[],
  monthId: string,
): RegularPreset[] {
  return presets.filter((preset) => isPresetApplicable(preset, monthId));
}
