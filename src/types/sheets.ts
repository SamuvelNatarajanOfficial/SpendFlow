/**
 * Data model for the Google Sheets–backed domain.
 *
 * These mirror the exact tab/column layout documented in
 * docs/GOOGLE_SHEETS_SETUP.md — keep the two in sync when changing fields.
 */

/** Status as stored in the sheet. "Overdue" is never stored — it's derived
 * from a PENDING item's due date at display time (see the finance engine). */
export type ItemStatus = 'PENDING' | 'PAID' | 'SKIPPED';

export type PresetCategory = 'HOME' | 'LOAN' | 'BILL' | 'FAMILY' | 'TRANSPORT' | 'OTHER';

export interface Salary {
  id: string;
  month: string;
  amount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegularPreset {
  id: string;
  name: string;
  category: PresetCategory;
  amount: number;
  /** 'YYYY-MM' — the preset first applies in this month. */
  startMonth: string;
  /** 'YYYY-MM', or null for an indefinite (open-ended) preset. */
  endMonth: string | null;
  /** Day of month (1–31) the item is due; clamped to the shortest month. */
  dueDay: number;
  active: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyItem {
  /** Deterministic: `${presetId}__${month}` — prevents duplicate generation. */
  id: string;
  month: string;
  presetId: string;
  name: string;
  category: PresetCategory;
  amount: number;
  status: ItemStatus;
  dueDate: string;
  paidDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExtraItem {
  id: string;
  month: string;
  name: string;
  amount: number;
  status: ItemStatus;
  dueDate: string;
  paidDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthSummary {
  id: string;
  year: number;
  month: number;
  label: string;
  closed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  id: string;
  currency: string;
  monthStartDay: number;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
}
