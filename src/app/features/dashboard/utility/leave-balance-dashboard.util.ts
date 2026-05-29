import type { ILeaveBalanceGetBaseResponseDto } from '@features/leave-management/types/leave.dto';
import type { IDashboardEmployeeLeaveBalanceRow } from '@features/dashboard/types/dashboard.interface';

export type ILeaveBalanceCardAggregate = Pick<
  ILeaveBalanceGetBaseResponseDto,
  'totalAllocated' | 'consumed' | 'availableBalance'
>;

function parseAmount(value: string | undefined): number {
  const n = Number.parseFloat(value ?? '');
  return Number.isFinite(n) ? n : 0;
}

function formatAmount(total: number): string {
  return Number.isInteger(total) ? String(total) : total.toFixed(2);
}

function employeeDisplayName(row: ILeaveBalanceGetBaseResponseDto): string {
  const first = row.user?.firstName?.trim() ?? '';
  const last = row.user?.lastName?.trim() ?? '';
  return `${first} ${last}`.trim() || 'Unknown';
}

/** Sums all balance rows (e.g. multiple leave categories for one user). */
export function aggregateLeaveBalanceRecords(
  records: readonly ILeaveBalanceGetBaseResponseDto[]
): ILeaveBalanceCardAggregate {
  let totalAllocated = 0;
  let consumed = 0;
  let availableBalance = 0;

  for (const row of records) {
    totalAllocated += parseAmount(row.totalAllocated);
    consumed += parseAmount(row.consumed);
    availableBalance += parseAmount(row.availableBalance);
  }

  return {
    totalAllocated: formatAmount(totalAllocated),
    consumed: formatAmount(consumed),
    availableBalance: formatAmount(availableBalance),
  };
}

/** One list row per API record (employee + leave category). */
export function mapLeaveBalanceRecordsToEmployeeRows(
  records: readonly ILeaveBalanceGetBaseResponseDto[]
): IDashboardEmployeeLeaveBalanceRow[] {
  const rows = records
    .filter(row => !!(row.user?.id ?? row.userId))
    .map(row => ({
      employeeName: employeeDisplayName(row),
      employeeCode: row.user?.employeeId,
      leaveCategory: row.leaveCategory,
      balance: parseAmount(row.availableBalance),
      unit: 'days' as const,
    }));

  return rows.sort((a, b) => {
    const byName = a.employeeName.localeCompare(b.employeeName);
    if (byName !== 0) {
      return byName;
    }
    return (a.leaveCategory ?? '').localeCompare(b.leaveCategory ?? '');
  });
}
