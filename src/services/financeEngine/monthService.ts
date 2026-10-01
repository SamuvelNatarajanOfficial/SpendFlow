import { salaryRepository } from '../googleSheets/repositories/salaryRepository';
import { presetRepository } from '../googleSheets/repositories/presetRepository';
import { monthlyItemRepository } from '../googleSheets/repositories/monthlyItemRepository';
import { extraItemRepository } from '../googleSheets/repositories/extraItemRepository';
import { reconcileMonthlyItems } from './monthlyItemGeneration';
import { computeDisplayStatus, type DisplayStatus } from './statusEngine';
import { computeMonthTotals, type MonthTotals } from './totals';
import { toDateId } from './month';
import { generateId } from '../../utils/id';
import type {
  ExtraItem,
  ItemStatus,
  MonthlyItem,
  RegularPreset,
} from '../../types/sheets';

export interface DisplayMonthlyItem extends MonthlyItem {
  displayStatus: DisplayStatus;
}

export interface DisplayExtraItem extends ExtraItem {
  displayStatus: DisplayStatus;
}

export interface MonthData {
  monthId: string;
  salary: number;
  regularItems: DisplayMonthlyItem[];
  extraItems: DisplayExtraItem[];
  totals: MonthTotals;
}

function withDisplayStatus<
  T extends { status: ItemStatus; dueDate: string; month: string },
>(item: T, today: Date): T & { displayStatus: DisplayStatus } {
  return {
    ...item,
    displayStatus: computeDisplayStatus(item.status, item.dueDate, item.month, today),
  };
}

/**
 * Loads everything needed to render one month: generates any missing
 * monthly items from active presets (persisting only the new ones — see
 * reconcileMonthlyItems for the duplicate-prevention rule), then computes
 * display statuses and totals.
 */
export async function loadMonth(
  monthId: string,
  today: Date = new Date(),
): Promise<MonthData> {
  const [presets, existingRegularItems, extraItemsRaw, salary] = await Promise.all([
    presetRepository.list(),
    monthlyItemRepository.listByMonth(monthId),
    extraItemRepository.listByMonth(monthId),
    salaryRepository.getByMonth(monthId),
  ]);

  const { toCreate } = reconcileMonthlyItems(presets, existingRegularItems, monthId);
  for (const item of toCreate) {
    await monthlyItemRepository.create(item);
  }

  const regularItems = [...existingRegularItems, ...toCreate].map((item) =>
    withDisplayStatus(item, today),
  );
  const extraItems = extraItemsRaw.map((item) => withDisplayStatus(item, today));

  const totals = computeMonthTotals({
    salary: salary?.amount ?? 0,
    regularItems,
    extraItems,
  });

  return { monthId, salary: salary?.amount ?? 0, regularItems, extraItems, totals };
}

function todayDateOnly(): string {
  return toDateId(new Date());
}

export function markMonthlyItemPaid(id: string): Promise<MonthlyItem> {
  return monthlyItemRepository.update(id, { status: 'PAID', paidDate: todayDateOnly() });
}

export function markMonthlyItemPending(id: string): Promise<MonthlyItem> {
  return monthlyItemRepository.update(id, { status: 'PENDING', paidDate: '' });
}

export function markExtraItemPaid(id: string): Promise<ExtraItem> {
  return extraItemRepository.update(id, { status: 'PAID', paidDate: todayDateOnly() });
}

export function markExtraItemPending(id: string): Promise<ExtraItem> {
  return extraItemRepository.update(id, { status: 'PENDING', paidDate: '' });
}

export async function setSalaryForMonth(monthId: string, amount: number): Promise<void> {
  await salaryRepository.upsertForMonth(monthId, amount);
}

export interface CreateExtraItemInput {
  name: string;
  amount: number;
  month: string;
  dueDate: string;
  notes: string;
}

export function createExtraItem(input: CreateExtraItemInput): Promise<ExtraItem> {
  const now = new Date().toISOString();
  const item: ExtraItem = {
    id: generateId(),
    month: input.month,
    name: input.name,
    amount: input.amount,
    status: 'PENDING',
    dueDate: input.dueDate,
    paidDate: '',
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
  };
  return extraItemRepository.create(item);
}

export interface PresetInput {
  name: string;
  category: RegularPreset['category'];
  amount: number;
  startMonth: string;
  endMonth: string | null;
  dueDay: number;
  notes: string;
}

export function createPreset(input: PresetInput): Promise<RegularPreset> {
  const now = new Date().toISOString();
  const preset: RegularPreset = {
    id: generateId(),
    active: true,
    createdAt: now,
    updatedAt: now,
    ...input,
  };
  return presetRepository.create(preset);
}

export function updatePreset(
  id: string,
  patch: Partial<PresetInput>,
): Promise<RegularPreset> {
  return presetRepository.update(id, { ...patch, updatedAt: new Date().toISOString() });
}

/** Presets are never deleted — old months may still reference them by ID. */
export function setPresetActive(id: string, active: boolean): Promise<RegularPreset> {
  return presetRepository.update(id, { active, updatedAt: new Date().toISOString() });
}

export function listPresets(): Promise<RegularPreset[]> {
  return presetRepository.list();
}
