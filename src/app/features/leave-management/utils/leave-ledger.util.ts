import { ICONS } from '@shared/constants';
import { IMetricGroup } from '@shared/types';
import {
  ILeaveLedgerGetResponseDto,
  ILeaveLedgerRecordDto,
} from '../types/leave-ledger.dto';
import { ELeaveLedgerEntryType } from '../types/leave-ledger.enum';
import {
  ILeaveLedgerParticulars,
  ILeaveLedgerTableRow,
} from '../types/leave-ledger.interface';

const MONTH_FORMAT = new Intl.DateTimeFormat('en-IN', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const DAY_FORMAT = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "2026-05-01" or "2026-05" → "May 2026" (plain dates, no time-zone shift). */
const monthLabel = (value: string | null): string => {
  if (!value) {
    return '';
  }
  const [year, month] = value.split('-').map(Number);
  return MONTH_FORMAT.format(new Date(Date.UTC(year, month - 1, 1)));
};

/** "2026-05-16" → "16 May 2026". */
const dayLabel = (value: string | null): string => {
  if (!value) {
    return '';
  }
  const [year, month, day] = value.split('-').map(Number);
  return DAY_FORMAT.format(new Date(Date.UTC(year, month - 1, day)));
};

const round = (value: number): number => Math.round(value * 100) / 100;

const workedNote = (record: ILeaveLedgerRecordDto): string =>
  record.workingDays !== null && record.paidDays !== null
    ? `Worked ${round(record.paidDays)} of ${record.workingDays} working days`
    : '';

/** "16 May 2026" for one day, "16 May 2026 – 25 May 2026" for several. */
const leaveDaysLabel = (record: ILeaveLedgerRecordDto): string =>
  record.leaveDateTo && record.leaveDateTo !== record.leaveDate
    ? `${dayLabel(record.leaveDate)} – ${dayLabel(record.leaveDateTo)}`
    : dayLabel(record.leaveDate);

const dayCountLabel = (count: number): string =>
  count === 1 ? '1 day' : `${count} days`;

/** The reason's own words in brackets, e.g. "(cancelled)" from "... given back (cancelled)". */
const bracketed = (reason: string | null): string =>
  /\(([^)]*)\)\s*$/.exec(reason ?? '')?.[1] ?? '';

/** Plain-language title and note of one statement line. */
export const describeLedgerRecord = (
  record: ILeaveLedgerRecordDto
): ILeaveLedgerParticulars => {
  const month = monthLabel(record.periodMonth);
  const leaveDays = leaveDaysLabel(record);
  const days = dayCountLabel(record.dayCount);

  switch (record.entryType as ELeaveLedgerEntryType) {
    case ELeaveLedgerEntryType.MONTHLY_ACCRUAL:
      if (record.days > 0) {
        return {
          particulars: `Leave earned for ${month}`,
          particularsNote: workedNote(record),
          icon: ICONS.COMMON.CALENDAR_PLUS,
        };
      }
      if (record.days === 0) {
        return {
          particulars: `No leave earned for ${month}`,
          particularsNote: workedNote(record) || 'No working days attended',
          icon: 'pi pi-calendar-times',
        };
      }
      return {
        particulars: `Leave reduced for ${month}`,
        particularsNote: `${workedNote(record)} — less than already given`,
        icon: 'pi pi-calendar-minus',
      };
    case ELeaveLedgerEntryType.ADVANCE_CREDIT:
      return {
        particulars: `Advance leave for ${month}`,
        particularsNote:
          'Given at the start of the month, adjusted to attendance when it ends',
        icon: 'pi pi-forward',
      };
    case ELeaveLedgerEntryType.HOLIDAY_WORK_CREDIT:
      return {
        particulars: 'Extra leave for working on a holiday',
        particularsNote: bracketed(record.reason),
        icon: 'pi pi-star',
      };
    case ELeaveLedgerEntryType.LEAVE_DEBIT:
      return {
        particulars: `Leave taken · ${leaveDays}`,
        particularsNote: days,
        icon: 'pi pi-sign-out',
      };
    case ELeaveLedgerEntryType.LEAVE_REVERSAL: {
      const cause = bracketed(record.reason);
      return {
        particulars: `Leave returned · ${leaveDays}`,
        particularsNote: cause ? `${days} · leave ${cause}` : days,
        icon: 'pi pi-replay',
      };
    }
    case ELeaveLedgerEntryType.LWP_CONVERSION:
      return {
        particulars: `Leave changed to LWP · ${leaveDays}`,
        particularsNote: `${days} · not enough leave earned, salary is cut for these days`,
        icon: 'pi pi-ban',
      };
    default:
      return {
        particulars: record.reason ?? 'Adjustment',
        particularsNote: '',
        icon: 'pi pi-circle',
      };
  }
};

export const buildLeaveLedgerRows = (
  records: ILeaveLedgerRecordDto[]
): ILeaveLedgerTableRow[] =>
  records.map(record => ({
    id: record.id,
    date: record.date,
    entryType: record.entryType,
    credit: round(record.credit),
    debit: round(record.debit),
    balance: round(record.balance),
    ...describeLedgerRecord(record),
  }));

/** Earned / used / available for the year shown. */
export const buildLeaveLedgerMetricGroups = (
  ledger: ILeaveLedgerGetResponseDto | null
): IMetricGroup[] => [
  {
    id: 'leave-ledger',
    title: ledger
      ? `Leave Balance · FY ${ledger.financialYear.slice(0, 5)}${ledger.financialYear.slice(7)}`
      : 'Leave Balance',
    icon: ICONS.COMMON.CHART_LINE,
    metrics: [
      {
        label: 'Earned',
        value: round(ledger?.summary.earned ?? 0),
        icon: ICONS.COMMON.ARROW_UP,
        description: 'From attendance and holiday work',
      },
      {
        label: 'Used',
        value: round(ledger?.summary.used ?? 0),
        icon: ICONS.COMMON.ARROW_DOWN,
        description: 'Leave taken, including pending',
      },
      {
        label: 'Available',
        value: round(ledger?.summary.available ?? 0),
        icon: ICONS.COMMON.CHART_LINE,
        description: 'What can be applied now',
      },
    ],
  },
];
