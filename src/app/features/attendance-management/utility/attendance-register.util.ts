import { DatePipe } from '@angular/common';
import { APP_CONFIG } from '@core/config';
import { EApprovalStatus } from '@shared/types';
import { toLocalCalendarDate, transformDateFormat } from '@shared/utility';
import { EAttendanceStatus } from '../types/attendance.enum';
import type {
  AttendanceRegisterCellTone,
  IAttendanceRegisterCell,
  IAttendanceRegisterColumn,
  IAttendanceRegisterReport,
  IAttendanceRegisterRow,
} from '../types/attendance-register.interface';
import type { IAttendanceGetBaseResponseDto } from '../types/attendance.dto';
import type { IEmployeeGetBaseResponseDto } from '@features/employee-management/types/employee.dto';

const REGISTER_PAGE_SIZE = 500;

export function getCurrentRegisterMonth(): Date {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1);
}

export function getMonthDateRange(monthYear: Date): { start: Date; end: Date } {
  const year = monthYear.getFullYear();
  const month = monthYear.getMonth();
  const start = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = lastDayOfMonth > today ? today : lastDayOfMonth;
  return { start, end };
}

export function getRegisterSummaryTone(
  field: string
): AttendanceRegisterCellTone {
  switch (field) {
    case 'summaryPresent':
      return 'present';
    case 'summaryAbsent':
      return 'absent';
    case 'summaryLeave':
      return 'leave';
    case 'summaryHoliday':
      return 'holiday';
    case 'summaryMissing':
      return 'missing';
    case 'summaryPending':
      return 'pending';
    default:
      return 'neutral';
  }
}

export function buildAttendanceRegisterReport(
  employees: IEmployeeGetBaseResponseDto[],
  attendanceRecords: IAttendanceGetBaseResponseDto[],
  monthYear: Date
): IAttendanceRegisterReport {
  const { start, end } = getMonthDateRange(monthYear);
  const columns = buildMonthColumns(start, end);

  const recordsByEmployeeDate = new Map<
    string,
    Map<string, IAttendanceGetBaseResponseDto>
  >();

  attendanceRecords.forEach(record => {
    const userId = record.user.id;
    const attendanceDate = toLocalCalendarDate(record.attendanceDate);
    if (!attendanceDate) {
      return;
    }

    const dateKey = formatDateKey(attendanceDate);
    const employeeMap =
      recordsByEmployeeDate.get(userId) ??
      new Map<string, IAttendanceGetBaseResponseDto>();
    employeeMap.set(dateKey, record);
    recordsByEmployeeDate.set(userId, employeeMap);
  });

  const monthEnd = new Date(
    monthYear.getFullYear(),
    monthYear.getMonth() + 1,
    0
  );
  const rows: IAttendanceRegisterRow[] = employees
    .filter(employee => isEmployeeEligibleForRegisterMonth(employee, monthEnd))
    .map(employee =>
      buildRegisterRow(
        employee,
        columns,
        recordsByEmployeeDate.get(employee.id)
      )
    );

  return { columns, rows };
}

export { REGISTER_PAGE_SIZE };

function formatDateKey(date: Date): string {
  return transformDateFormat(date);
}

function buildMonthColumns(
  rangeStart: Date,
  rangeEnd: Date
): IAttendanceRegisterColumn[] {
  const datePipe = new DatePipe(APP_CONFIG.DATE_FORMATS.DISPLAY_LOCALE);
  const columns: IAttendanceRegisterColumn[] = [];
  const totalDays =
    Math.floor((rangeEnd.getTime() - rangeStart.getTime()) / 86_400_000) + 1;

  for (let dayOffset = 0; dayOffset < totalDays; dayOffset += 1) {
    const cursor = new Date(rangeStart);
    cursor.setDate(rangeStart.getDate() + dayOffset);
    columns.push({
      dateKey: formatDateKey(cursor),
      dayLabel: datePipe.transform(cursor, 'd MMM') ?? String(cursor.getDate()),
      weekdayLabel: datePipe.transform(cursor, 'EEE') ?? '',
    });
  }

  return columns;
}

function isEmployeeEligibleForRegisterMonth(
  employee: IEmployeeGetBaseResponseDto,
  monthEnd: Date
): boolean {
  const joiningDate = toLocalCalendarDate(employee.dateOfJoining);
  return !joiningDate || joiningDate <= monthEnd;
}

function buildRegisterRow(
  employee: IEmployeeGetBaseResponseDto,
  columns: IAttendanceRegisterColumn[],
  employeeRecords?: Map<string, IAttendanceGetBaseResponseDto>
): IAttendanceRegisterRow {
  const joiningDate = toLocalCalendarDate(employee.dateOfJoining);
  const cells: Record<string, IAttendanceRegisterCell> = {};
  const summary = emptySummary();

  columns.forEach(column => {
    const cellDate = toLocalCalendarDate(column.dateKey);
    if (!cellDate) {
      cells[column.dateKey] = createNeutralCell('Invalid date');
      return;
    }

    if (joiningDate && cellDate < joiningDate) {
      cells[column.dateKey] = createNeutralCell('Before joining date');
      return;
    }

    const record = employeeRecords?.get(column.dateKey);
    if (!record) {
      const missingCell = createMissingCell();
      cells[column.dateKey] = missingCell;
      updateSummaryFromCell(summary, missingCell);
      return;
    }

    const cell = buildCellFromRecord(record);
    cells[column.dateKey] = cell;
    updateSummaryFromCell(summary, cell);
  });

  return {
    employeeId: employee.id,
    employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
    employeeCode: employee.employeeId,
    cells,
    summary,
  };
}

function isPendingAttendance(record: IAttendanceGetBaseResponseDto): boolean {
  return (
    record.approvalStatus === EApprovalStatus.PENDING ||
    record.status === EAttendanceStatus.APPROVAL_PENDING
  );
}

function getStatusCode(status: string): {
  code: string;
  tone: AttendanceRegisterCellTone;
  label: string;
} {
  switch (status) {
    case EAttendanceStatus.PRESENT:
      return { code: 'P', tone: 'present', label: 'Present' };
    case EAttendanceStatus.ABSENT:
      return { code: 'A', tone: 'absent', label: 'Absent' };
    case EAttendanceStatus.LEAVE:
      return { code: 'L', tone: 'leave', label: 'Leave' };
    case EAttendanceStatus.HOLIDAY:
      return { code: 'H', tone: 'holiday', label: 'Holiday' };
    case EAttendanceStatus.CHECKED_IN:
      return { code: 'I', tone: 'checkedIn', label: 'Checked In' };
    case EAttendanceStatus.CHECKED_OUT:
      return { code: 'O', tone: 'checkedOut', label: 'Checked Out' };
    case EAttendanceStatus.NOT_CHECKED_IN_YET:
      return { code: '?', tone: 'notCheckedIn', label: 'Not checked in yet' };
    case EAttendanceStatus.APPROVAL_PENDING:
      return { code: '*', tone: 'pending', label: 'Approval pending' };
    default:
      return { code: 'NA', tone: 'neutral', label: status };
  }
}

function buildCellFromRecord(
  record: IAttendanceGetBaseResponseDto
): IAttendanceRegisterCell {
  const statusMeta = getStatusCode(record.status);
  const pending = isPendingAttendance(record);
  const code =
    pending && statusMeta.code !== '*'
      ? `${statusMeta.code}*`
      : statusMeta.code;

  return {
    code,
    tone: pending ? 'pending' : statusMeta.tone,
    tooltip: pending
      ? `${statusMeta.label} · Approval pending`
      : statusMeta.label,
  };
}

function createNeutralCell(tooltip: string): IAttendanceRegisterCell {
  return { code: 'NA', tone: 'neutral', tooltip };
}

function createMissingCell(): IAttendanceRegisterCell {
  return { code: 'M', tone: 'missing', tooltip: 'Missing attendance' };
}

function emptySummary(): IAttendanceRegisterRow['summary'] {
  return {
    present: 0,
    absent: 0,
    leave: 0,
    holiday: 0,
    missing: 0,
    pending: 0,
  };
}

function updateSummaryFromCell(
  summary: IAttendanceRegisterRow['summary'],
  cell: IAttendanceRegisterCell
): void {
  if (cell.code.startsWith('P')) {
    summary.present += 1;
  } else if (cell.code.startsWith('A')) {
    summary.absent += 1;
  } else if (cell.code.startsWith('L')) {
    summary.leave += 1;
  } else if (cell.code.startsWith('H')) {
    summary.holiday += 1;
  }

  if (cell.code === 'M' || cell.tone === 'missing') {
    summary.missing += 1;
  }

  if (cell.code.includes('*') || cell.tone === 'pending') {
    summary.pending += 1;
  }
}
