import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MonthlyItem, RegularPreset } from '../../types/sheets';

const presetRepository = {
  list: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
};
const monthlyItemRepository = {
  listByMonth: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
};
const extraItemRepository = {
  listByMonth: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
};
const salaryRepository = {
  getByMonth: vi.fn(),
  upsertForMonth: vi.fn(),
};

vi.mock('../googleSheets/repositories/presetRepository', () => ({ presetRepository }));
vi.mock('../googleSheets/repositories/monthlyItemRepository', () => ({
  monthlyItemRepository,
}));
vi.mock('../googleSheets/repositories/extraItemRepository', () => ({
  extraItemRepository,
}));
vi.mock('../googleSheets/repositories/salaryRepository', () => ({ salaryRepository }));

function makePreset(overrides: Partial<RegularPreset> = {}): RegularPreset {
  return {
    id: 'loan',
    name: 'Loan A',
    category: 'LOAN',
    amount: 7500,
    startMonth: '2027-01',
    endMonth: '2027-06',
    dueDay: 5,
    active: true,
    notes: '',
    createdAt: '2027-01-01T00:00:00.000Z',
    updatedAt: '2027-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('monthService.loadMonth', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('generates and persists a monthly item the first time a month is opened', async () => {
    presetRepository.list.mockResolvedValue([makePreset()]);
    monthlyItemRepository.listByMonth.mockResolvedValue([]);
    extraItemRepository.listByMonth.mockResolvedValue([]);
    salaryRepository.getByMonth.mockResolvedValue({ amount: 50000 });
    monthlyItemRepository.create.mockResolvedValue(undefined);

    const { loadMonth } = await import('./monthService');
    const data = await loadMonth('2027-01', new Date(2027, 0, 10));

    expect(monthlyItemRepository.create).toHaveBeenCalledOnce();
    expect(data.regularItems).toHaveLength(1);
    expect(data.regularItems[0].id).toBe('loan__2027-01');
    expect(data.totals.salary).toBe(50000);
  });

  it('does not re-create the monthly item once it already exists (duplicate prevention)', async () => {
    const existing: MonthlyItem = {
      id: 'loan__2027-01',
      month: '2027-01',
      presetId: 'loan',
      name: 'Loan A',
      category: 'LOAN',
      amount: 7500,
      status: 'PAID',
      dueDate: '2027-01-05',
      paidDate: '2027-01-03',
      notes: '',
      createdAt: '2027-01-01T00:00:00.000Z',
      updatedAt: '2027-01-03T00:00:00.000Z',
    };

    presetRepository.list.mockResolvedValue([makePreset()]);
    monthlyItemRepository.listByMonth.mockResolvedValue([existing]);
    extraItemRepository.listByMonth.mockResolvedValue([]);
    salaryRepository.getByMonth.mockResolvedValue({ amount: 50000 });

    const { loadMonth } = await import('./monthService');
    const data = await loadMonth('2027-01', new Date(2027, 0, 10));

    expect(monthlyItemRepository.create).not.toHaveBeenCalled();
    expect(data.regularItems).toHaveLength(1);
    expect(data.regularItems[0].status).toBe('PAID');
    expect(data.regularItems[0].displayStatus).toBe('paid');
  });

  it('does not generate an item for a month after the preset has expired', async () => {
    presetRepository.list.mockResolvedValue([makePreset({ endMonth: '2027-06' })]);
    monthlyItemRepository.listByMonth.mockResolvedValue([]);
    extraItemRepository.listByMonth.mockResolvedValue([]);
    salaryRepository.getByMonth.mockResolvedValue(null);

    const { loadMonth } = await import('./monthService');
    const data = await loadMonth('2027-07', new Date(2027, 6, 1));

    expect(monthlyItemRepository.create).not.toHaveBeenCalled();
    expect(data.regularItems).toHaveLength(0);
    expect(data.salary).toBe(0);
  });
});

describe('monthService mark paid/pending', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("marks a monthly item paid with today's date", async () => {
    monthlyItemRepository.update.mockResolvedValue({ id: 'x', status: 'PAID' });
    const { markMonthlyItemPaid } = await import('./monthService');

    await markMonthlyItemPaid('x');

    expect(monthlyItemRepository.update).toHaveBeenCalledWith(
      'x',
      expect.objectContaining({ status: 'PAID', paidDate: expect.any(String) }),
    );
  });

  it('marks a monthly item back to pending and clears the paid date', async () => {
    monthlyItemRepository.update.mockResolvedValue({ id: 'x', status: 'PENDING' });
    const { markMonthlyItemPending } = await import('./monthService');

    await markMonthlyItemPending('x');

    expect(monthlyItemRepository.update).toHaveBeenCalledWith('x', {
      status: 'PENDING',
      paidDate: '',
    });
  });

  it('marks an extra item paid and pending symmetrically', async () => {
    extraItemRepository.update.mockResolvedValue({ id: 'y', status: 'PAID' });
    const { markExtraItemPaid, markExtraItemPending } = await import('./monthService');

    await markExtraItemPaid('y');
    expect(extraItemRepository.update).toHaveBeenCalledWith(
      'y',
      expect.objectContaining({ status: 'PAID' }),
    );

    await markExtraItemPending('y');
    expect(extraItemRepository.update).toHaveBeenCalledWith('y', {
      status: 'PENDING',
      paidDate: '',
    });
  });
});

describe('monthService salary and presets', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('delegates setSalaryForMonth to the repository upsert', async () => {
    salaryRepository.upsertForMonth.mockResolvedValue(undefined);
    const { setSalaryForMonth } = await import('./monthService');

    await setSalaryForMonth('2027-01', 55000);

    expect(salaryRepository.upsertForMonth).toHaveBeenCalledWith('2027-01', 55000);
  });

  it('creates a preset as active by default', async () => {
    presetRepository.create.mockImplementation((preset) => Promise.resolve(preset));
    const { createPreset } = await import('./monthService');

    const created = await createPreset({
      name: 'Rent',
      category: 'HOME',
      amount: 15000,
      startMonth: '2027-01',
      endMonth: null,
      dueDay: 5,
      notes: '',
    });

    expect(created.active).toBe(true);
    expect(created.id).toBeTruthy();
  });

  it('deactivating a preset updates active without deleting it', async () => {
    presetRepository.update.mockResolvedValue({ id: 'p1', active: false });
    const { setPresetActive } = await import('./monthService');

    await setPresetActive('p1', false);

    expect(presetRepository.update).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({ active: false }),
    );
  });
});
