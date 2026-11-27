import {
  LEAVE_LEDGER_ENTRY_TYPE_VIEW,
  LEAVE_LEDGER_UNKNOWN_ENTRY_VIEW,
} from '../config/leave-ledger.config';
import {
  ILeaveLedgerGetResponseDto,
  ILeaveLedgerMonthDto,
} from '../types/leave-ledger.dto';
import { ELeaveLedgerEntryType } from '../types/leave-ledger.enum';
import {
  ILeaveLedgerEntryTypeView,
  ILeaveLedgerMonthRow,
  ILeaveSummaryCard,
} from '../types/leave-ledger.interface';

const MONTH_FORMAT = new Intl.DateTimeFormat('en-IN', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "2026-05" → "May 2026" (no time-zone shift: the month is a plain string). */
export const formatLeaveMonth = (month: string): string => {
  const [year, mon] = month.split('-').map(Number);
  return MONTH_FORMAT.format(new Date(Date.UTC(year, mon - 1, 1)));
};

export const roundLeave = (value: number): number =>
  Math.round(value * 100) / 100;

export const getLedgerEntryView = (
  entryType: string
): ILeaveLedgerEntryTypeView =>
  LEAVE_LEDGER_ENTRY_TYPE_VIEW[entryType as ELeaveLedgerEntryType] ??
  LEAVE_LEDGER_UNKNOWN_ENTRY_VIEW;

export const buildLeaveSummaryCards = (
  summary: ILeaveLedgerGetResponseDto['summary']
): ILeaveSummaryCard[] => [
  {
    label: 'Credited',
    value: roundLeave(summary.credited),
    hint: 'Earned from attendance, advances and holiday work',
    icon: 'pi pi-arrow-up',
    tone: 'credited',
  },
  {
    label: 'Used',
    value: roundLeave(summary.used),
    hint: 'Leave taken, including pending applications',
    icon: 'pi pi-arrow-down',
    tone: 'used',
  },
  {
    label: 'Available',
    value: roundLeave(summary.available),
    hint: 'What you can apply for now (never below 0)',
    icon: 'pi pi-wallet',
    tone: 'available',
  },
];

export const buildLeaveMonthRows = (
  months: ILeaveLedgerMonthDto[],
  currentMonth: string
): ILeaveLedgerMonthRow[] =>
  months.map(month => ({
    month: month.month,
    label: formatLeaveMonth(month.month),
    workingDays: month.workingDays,
    paidDays: roundLeave(month.paidDays),
    absentOrUnpaidDays: roundLeave(
      Math.max(0, month.workingDays - month.paidDays)
    ),
    earned: roundLeave(month.earned),
    credited: roundLeave(month.credited),
    inProgress: month.month === currentMonth,
  }));

/** Current month as YYYY-MM in India time. */
export const currentLeaveMonth = (): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
  }).format(new Date());
