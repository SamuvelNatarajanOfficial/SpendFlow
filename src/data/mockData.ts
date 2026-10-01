import type { Expense, MonthSummary, Preset } from '../types';

/**
 * Mock data layer — isolated so it can be swapped for the Google Sheets
 * integration later without touching component code.
 */

export const mockCurrentMonthId = '2027-01';

export const mockMonths: MonthSummary[] = [
  {
    id: '2026-12',
    label: 'December 2026',
    year: 2026,
    month: 12,
    salary: 50000,
    regularTotal: 27800,
    extraTotal: 6200,
    remaining: 16000,
    regularCompletion: 100,
    extraCompletion: 100,
  },
  {
    id: '2027-01',
    label: 'January 2027',
    year: 2027,
    month: 1,
    salary: 50000,
    regularTotal: 28500,
    extraTotal: 4500,
    remaining: 17000,
    regularCompletion: 72,
    extraCompletion: 45,
  },
  {
    id: '2027-02',
    label: 'February 2027',
    year: 2027,
    month: 2,
    salary: 50000,
    regularTotal: 0,
    extraTotal: 0,
    remaining: 50000,
    regularCompletion: 0,
    extraCompletion: 0,
  },
];

export const mockRegularExpenses: Expense[] = [
  {
    id: 'reg-1',
    name: 'Rent',
    category: 'regular',
    amount: 15000,
    status: 'paid',
    dueDate: '2027-01-05',
  },
  {
    id: 'reg-2',
    name: 'Electricity Bill',
    category: 'regular',
    amount: 2200,
    status: 'paid',
    dueDate: '2027-01-10',
  },
  {
    id: 'reg-3',
    name: 'Internet',
    category: 'regular',
    amount: 1200,
    status: 'pending',
    dueDate: '2027-01-18',
  },
  {
    id: 'reg-4',
    name: 'Groceries',
    category: 'regular',
    amount: 6500,
    status: 'pending',
    dueDate: '2027-01-20',
  },
  {
    id: 'reg-5',
    name: 'Mobile Recharge',
    category: 'regular',
    amount: 600,
    status: 'overdue',
    dueDate: '2027-01-02',
  },
  {
    id: 'reg-6',
    name: 'Insurance Premium',
    category: 'regular',
    amount: 3000,
    status: 'paid',
    dueDate: '2027-01-08',
  },
];

export const mockExtraExpenses: Expense[] = [
  {
    id: 'ext-1',
    name: 'Birthday Gift',
    category: 'extra',
    amount: 1500,
    status: 'paid',
    dueDate: '2027-01-14',
  },
  {
    id: 'ext-2',
    name: 'Weekend Trip',
    category: 'extra',
    amount: 2500,
    status: 'pending',
    dueDate: '2027-01-25',
  },
  {
    id: 'ext-3',
    name: 'Home Decor',
    category: 'extra',
    amount: 500,
    status: 'overdue',
    dueDate: '2027-01-03',
  },
];

export const mockPresets: Preset[] = [
  { id: 'preset-1', name: 'Rent', category: 'regular', amount: 15000, recurring: true },
  {
    id: 'preset-2',
    name: 'Electricity Bill',
    category: 'regular',
    amount: 2200,
    recurring: true,
  },
  {
    id: 'preset-3',
    name: 'Internet',
    category: 'regular',
    amount: 1200,
    recurring: true,
  },
  {
    id: 'preset-4',
    name: 'Insurance Premium',
    category: 'regular',
    amount: 3000,
    recurring: true,
  },
  {
    id: 'preset-5',
    name: 'Streaming Subscriptions',
    category: 'extra',
    amount: 800,
    recurring: true,
  },
];
