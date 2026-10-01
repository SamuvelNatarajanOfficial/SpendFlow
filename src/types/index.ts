import type { ComponentType } from 'react';

/** Payment status for an individual expense entry. */
export type ExpenseStatus = 'paid' | 'pending' | 'overdue';

/** High-level spending category used for colour-coding across the UI. */
export type ExpenseCategory = 'regular' | 'extra';

export interface Expense {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  status: ExpenseStatus;
  dueDate: string;
  notes?: string;
}

export interface MonthSummary {
  id: string;
  label: string;
  year: number;
  month: number;
  salary: number;
  regularTotal: number;
  extraTotal: number;
  remaining: number;
  regularCompletion: number;
  extraCompletion: number;
}

export interface Preset {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  recurring: boolean;
}

export interface NavItem {
  label: string;
  path: string;
  icon: ComponentType<{ className?: string; size?: number }>;
}
