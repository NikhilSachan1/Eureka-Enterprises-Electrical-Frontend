import { EDataType, IDataTableHeaderConfig } from '@shared/types';
import type { IAttendanceRegisterReport } from '../types/attendance-register.interface';

const SUMMARY_COLUMNS = [
  { field: 'summaryPresent', header: 'P' },
  { field: 'summaryAbsent', header: 'A' },
  { field: 'summaryLeave', header: 'L' },
  { field: 'summaryHoliday', header: 'H' },
  { field: 'summaryMissing', header: 'M' },
  { field: 'summaryPending', header: '*' },
] as const;

export function buildAttendanceRegisterTableHeaders(
  report: IAttendanceRegisterReport
): IDataTableHeaderConfig[] {
  const employeeColumn: Partial<IDataTableHeaderConfig> = {
    field: 'employeeName',
    header: 'Employee',
    bodyTemplate: EDataType.TEXT_WITH_SUBTITLE,
    subtitle: { field: 'employeeCode' },
    primaryFieldHighlight: true,
    frozen: true,
    alignFrozen: 'left',
    columnWidth: '14rem',
    showSort: true,
    showFilter: false,
  };

  const dateColumns: Partial<IDataTableHeaderConfig>[] = report.columns.map(
    column => ({
      field: column.dateKey,
      header: `${column.dayLabel}\n${column.weekdayLabel}`,
      customTemplateKey: 'registerCell',
      columnStyleClass: 'register-date-column',
      columnWidth: '5.5rem',
      showSort: false,
      showFilter: false,
    })
  );

  const summaryColumns: Partial<IDataTableHeaderConfig>[] = SUMMARY_COLUMNS.map(
    item => ({
      field: item.field,
      header: item.header,
      customTemplateKey: 'registerSummary',
      columnStyleClass: 'register-summary-column',
      columnWidth: '3rem',
      showSort: false,
      showFilter: false,
    })
  );

  return [
    employeeColumn,
    ...dateColumns,
    ...summaryColumns,
  ] as IDataTableHeaderConfig[];
}

export function mapAttendanceRegisterToTableData(
  report: IAttendanceRegisterReport
): Record<string, unknown>[] {
  return [...report.rows]
    .sort((left, right) =>
      left.employeeName.localeCompare(right.employeeName, undefined, {
        sensitivity: 'base',
      })
    )
    .map(row => ({
      id: row.employeeId,
      employeeName: row.employeeName,
      employeeCode: row.employeeCode,
      ...row.cells,
      summaryPresent: row.summary.present,
      summaryAbsent: row.summary.absent,
      summaryLeave: row.summary.leave,
      summaryHoliday: row.summary.holiday,
      summaryMissing: row.summary.missing,
      summaryPending: row.summary.pending,
    }));
}
