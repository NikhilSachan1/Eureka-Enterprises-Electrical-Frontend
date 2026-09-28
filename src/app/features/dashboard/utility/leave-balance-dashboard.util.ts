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

/** One dashboard row per employee — remaining balance summed across leave types. */
export function mapLeaveBalanceRecordsToEmployeeRows(
  records: readonly ILeaveBalanceGetBaseResponseDto[]
): IDashboardEmployeeLeaveBalanceRow[] {
  const byEmployee = new Map<string, IDashboardEmployeeLeaveBalanceRow>();

  for (const row of records) {
    const employeeKey = row.user?.id ?? row.userId;
    if (!employeeKey) {
      continue;
    }

    const existing = byEmployee.get(employeeKey);
    const balance = parseAmount(row.availableBalance);

    if (existing) {
      byEmployee.set(employeeKey, {
        ...existing,
        balance: existing.balance + balance,
      });
      continue;
    }

    const employeeName = employeeDisplayName(row);
    const employeeCode = row.user?.employeeId;

    byEmployee.set(employeeKey, {
      employeeName,
      employeeCode,
      searchText: `${employeeName} ${employeeCode ?? ''}`.toLowerCase(),
      balance,
      unit: 'days',
    });
  }

  return [...byEmployee.values()].sort((a, b) =>
    a.employeeName.localeCompare(b.employeeName)
  );
}
