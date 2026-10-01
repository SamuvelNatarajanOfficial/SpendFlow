/**
 * Data model for the Google Sheets–backed domain (Phase 2).
 *
 * These mirror the exact tab/column layout documented in
 * docs/GOOGLE_SHEETS_SETUP.md — keep the two in sync when changing fields.
 */

export type ItemStatus = 'paid' | 'pending' | 'overdue';

export interface Salary {
  id: string;
  monthId: string;
  amount: number;
  effectiveDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegularPreset {
  id: string;
  name: string;
  defaultAmount: number;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyItem {
  id: string;
  monthId: string;
  presetId: string;
  name: string;
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
  monthId: string;
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
