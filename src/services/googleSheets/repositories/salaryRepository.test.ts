import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Salary } from '../../../types/sheets';

const getSheetRows = vi.fn();
const appendRow = vi.fn();
const updateRowByRowNumber = vi.fn();
const deleteRowByRowNumber = vi.fn();
const findRowIndexById = vi.fn();

vi.mock('../sheets', () => ({
  getSheetRows,
  appendRow,
  updateRowByRowNumber,
  deleteRowByRowNumber,
  findRowIndexById,
}));

const row1 = [
  'id-1',
  '2027-01',
  '50000',
  '',
  '2027-01-01T00:00:00.000Z',
  '2027-01-01T00:00:00.000Z',
];
const row2 = [
  'id-2',
  '2027-02',
  '52000',
  '',
  '2027-02-01T00:00:00.000Z',
  '2027-02-01T00:00:00.000Z',
];

describe('salaryRepository', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('lists all salary records, mapped from sheet rows', async () => {
    getSheetRows.mockResolvedValue({ headers: [], rows: [row1, row2] });
    const { salaryRepository } = await import('./salaryRepository');

    const result = await salaryRepository.list();

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ id: 'id-1', month: '2027-01', amount: 50000 });
  });

  it('filters records by month', async () => {
    getSheetRows.mockResolvedValue({ headers: [], rows: [row1, row2] });
    const { salaryRepository } = await import('./salaryRepository');

    const result = await salaryRepository.listByMonth('2027-02');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('id-2');
  });

  it('getByMonth returns the most recently updated match', async () => {
    const older = [
      'id-1',
      '2027-03',
      '40000',
      '',
      '2027-03-01T00:00:00.000Z',
      '2027-03-01T00:00:00.000Z',
    ];
    const newer = [
      'id-2',
      '2027-03',
      '45000',
      '',
      '2027-03-15T00:00:00.000Z',
      '2027-03-15T00:00:00.000Z',
    ];
    getSheetRows.mockResolvedValue({ headers: [], rows: [older, newer] });
    const { salaryRepository } = await import('./salaryRepository');

    const result = await salaryRepository.getByMonth('2027-03');

    expect(result?.id).toBe('id-2');
  });

  it('getByMonth returns null when no record exists', async () => {
    getSheetRows.mockResolvedValue({ headers: [], rows: [] });
    const { salaryRepository } = await import('./salaryRepository');

    expect(await salaryRepository.getByMonth('2027-04')).toBeNull();
  });

  it('creates a record by appending a serialized row', async () => {
    appendRow.mockResolvedValue(undefined);
    const { salaryRepository } = await import('./salaryRepository');

    const salary: Salary = {
      id: 'id-3',
      month: '2027-03',
      amount: 51000,
      notes: '',
      createdAt: '2027-03-01T00:00:00.000Z',
      updatedAt: '2027-03-01T00:00:00.000Z',
    };

    await salaryRepository.create(salary);

    expect(appendRow).toHaveBeenCalledWith('Salary', [
      'id-3',
      '2027-03',
      '51000',
      '',
      '2027-03-01T00:00:00.000Z',
      '2027-03-01T00:00:00.000Z',
    ]);
  });

  it('upsertForMonth creates a new record when none exists for the month', async () => {
    getSheetRows.mockResolvedValue({ headers: [], rows: [] });
    appendRow.mockResolvedValue(undefined);
    const { salaryRepository } = await import('./salaryRepository');

    const result = await salaryRepository.upsertForMonth('2027-05', 60000);

    expect(result).toMatchObject({ month: '2027-05', amount: 60000 });
    expect(appendRow).toHaveBeenCalledOnce();
  });

  it('upsertForMonth updates the existing record for the month', async () => {
    getSheetRows.mockResolvedValue({ headers: [], rows: [row1] });
    findRowIndexById.mockResolvedValue({ rowNumber: 2, row: row1 });
    updateRowByRowNumber.mockResolvedValue(undefined);
    const { salaryRepository } = await import('./salaryRepository');

    const result = await salaryRepository.upsertForMonth('2027-01', 70000);

    expect(result.amount).toBe(70000);
    expect(updateRowByRowNumber).toHaveBeenCalledWith(
      'Salary',
      2,
      expect.arrayContaining(['70000']),
    );
  });

  it('updates a record found by ID', async () => {
    findRowIndexById.mockResolvedValue({ rowNumber: 2, row: row1 });
    updateRowByRowNumber.mockResolvedValue(undefined);
    const { salaryRepository } = await import('./salaryRepository');

    const updated = await salaryRepository.update('id-1', { amount: 60000 });

    expect(updated.amount).toBe(60000);
    expect(updateRowByRowNumber).toHaveBeenCalledWith(
      'Salary',
      2,
      expect.arrayContaining(['60000']),
    );
  });

  it('throws when updating a record that does not exist', async () => {
    findRowIndexById.mockResolvedValue(null);
    const { salaryRepository } = await import('./salaryRepository');

    await expect(salaryRepository.update('missing', { amount: 1 })).rejects.toThrow();
  });

  it('removes a record found by ID', async () => {
    findRowIndexById.mockResolvedValue({ rowNumber: 3, row: row2 });
    deleteRowByRowNumber.mockResolvedValue(undefined);
    const { salaryRepository } = await import('./salaryRepository');

    await salaryRepository.remove('id-2');

    expect(deleteRowByRowNumber).toHaveBeenCalledWith('Salary', 3);
  });

  it('does nothing when removing a record that does not exist', async () => {
    findRowIndexById.mockResolvedValue(null);
    const { salaryRepository } = await import('./salaryRepository');

    await salaryRepository.remove('missing');

    expect(deleteRowByRowNumber).not.toHaveBeenCalled();
  });
});
