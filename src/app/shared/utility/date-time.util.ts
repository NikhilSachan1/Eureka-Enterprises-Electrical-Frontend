import { DatePipe } from '@angular/common';
import { APP_CONFIG } from '@core/config';
import { PAYSLIP_DATE_DATA } from '@shared/config/static-data.config';

export const convertSecondsToDhms = (seconds: number): string => {
  if (!seconds || seconds < 0) {
    return '00:00:00';
  }

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (days > 0) {
    return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
  }
  return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
};

const pad = (num: number): string => {
  return num.toString().padStart(2, '0');
};

/**
 * Normalizes a value to local midnight for that calendar day.
 * Supports `YYYY-MM-DD`, ISO datetimes, and `Date`.
 */
export const toLocalCalendarDate = (
  value: Date | string | null | undefined
): Date | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null;
    }
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  const trimmed = String(value).trim();
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (ymd) {
    const y = Number(ymd[1]);
    const m = Number(ymd[2]);
    const d = Number(ymd[3]);
    if (y && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return new Date(y, m - 1, d);
    }
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

export const getPayslipCutoffMinDate = (): Date => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const cutOffDate = PAYSLIP_DATE_DATA.EVERY_MONTH;

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const cutoffDate = new Date(currentYear, currentMonth, cutOffDate);

  if (today <= cutoffDate) {
    return new Date(prevMonthYear, prevMonth, 1);
  }
  return new Date(currentYear, currentMonth, 1);
};

export const getPayslipCutoffMaxDate = (): Date => {
  const today = new Date();
  const currentDate = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const payslipGenerationDate = PAYSLIP_DATE_DATA.EVERY_MONTH;

  let maxMonth: number;
  let maxYear: number;

  let previousMonth: number;
  let previousYear: number;

  if (currentMonth === 0) {
    previousMonth = 11;
    previousYear = currentYear - 1;
  } else {
    previousMonth = currentMonth - 1;
    previousYear = currentYear;
  }

  if (currentDate < payslipGenerationDate) {
    if (previousMonth === 0) {
      maxMonth = 11;
      maxYear = previousYear - 1;
    } else {
      maxMonth = previousMonth - 1;
      maxYear = previousYear;
    }
  } else {
    maxMonth = previousMonth;
    maxYear = previousYear;
  }

  return new Date(maxYear, maxMonth + 1, 0);
};

/**
 * Local start-of-day for `dayOfMonth` in `(year, monthIndex)` (`monthIndex` 0–11).
 * If `dayOfMonth` is past the month’s length (e.g. 31 in February), uses the last day of that month.
 */
export const getStartOfLocalDayInMonth = (
  year: number,
  monthIndex: number,
  dayOfMonth: number
): Date => {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const day = Math.min(dayOfMonth, lastDay);
  const d = new Date(year, monthIndex, day);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Payroll lock for approve / reject / regularize:
 * 1. Before the payslip day for the attendance month → locked.
 * 2. After that day: still locked if the **attendance day-of-month** is before
 *    {@link PAYSLIP_DATE_DATA.EVERY_MONTH} (e.g. 23rd vs 25th); only rows on/after that day unlock.
 */
export const isPayrollLocked = (date: Date | string): boolean => {
  const calendar = toLocalCalendarDate(date);
  if (calendar === null) {
    return false;
  }

  const payslipDay = PAYSLIP_DATE_DATA.EVERY_MONTH;
  const sameMonthPayroll = PAYSLIP_DATE_DATA.CURRENT_MONTH === true;

  const y = calendar.getFullYear();
  const m = calendar.getMonth();
  const d = calendar.getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayY = today.getFullYear();
  const todayM = today.getMonth();

  const firstOfCurrentMonth = new Date(todayY, todayM, 1);
  const attendanceMonthStart = new Date(y, m, 1);

  if (sameMonthPayroll) {
    if (attendanceMonthStart > firstOfCurrentMonth) {
      return false;
    }

    const payrollRunInAttendanceMonth = getStartOfLocalDayInMonth(
      y,
      m,
      payslipDay
    );
    if (today < payrollRunInAttendanceMonth) {
      return false;
    }

    if (attendanceMonthStart < firstOfCurrentMonth) {
      return true;
    }

    return d <= payslipDay;
  }

  const lockAfterPreviousMonthPayroll = getStartOfLocalDayInMonth(
    m === 11 ? y + 1 : y,
    m === 11 ? 0 : m + 1,
    payslipDay
  );

  return today >= lockAfterPreviousMonthPayroll;
};

export const transformDateFormat = (
  value: string | Date,
  dateFormat: string = APP_CONFIG.DATE_FORMATS.API
): string => {
  const datePipe = new DatePipe('en-US');
  return datePipe.transform(value, dateFormat) as string;
};

export const transformTimeFormat = (
  value: string | Date | null | undefined,
  timeFormat: string = APP_CONFIG.TIME_FORMATS.API
): string => {
  if (value === null || value === undefined) {
    return '';
  }
  const datePipe = new DatePipe('en-US');
  return datePipe.transform(value, timeFormat) as string;
};

/**
 * Formats date with time for API payload, using browser timezone.
 * Use when API expects date+time (e.g. startAt, expiryAt).
 */
export const transformDateTimeFormat = (
  value: string | Date | null | undefined,
  dateTimeFormat: string = APP_CONFIG.DATE_FORMATS.API_DATETIME,
  timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
): string => {
  if (value === null || value === undefined) {
    return '';
  }
  const datePipe = new DatePipe('en-US');
  return datePipe.transform(value, dateTimeFormat, timezone) as string;
};

export const getDateBeforeXDays = (xDays: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - xDays);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const formatMonthYear = (month: number, year: number): string => {
  const datePipe = new DatePipe('en-US');
  const date = new Date(year, month - 1, 1);
  return datePipe.transform(date, APP_CONFIG.DATE_FORMATS.MONTH_YEAR) as string;
};

/**
 * Turns standalone 24h clock tokens (HH:mm) in a string into 12h with AM/PM.
 * Used for API error text such as "allowed only between 09:50 and 22:47".
 */
export const format24hClockTimesInTextTo12h = (text: string): string => {
  if (!text) {
    return text;
  }
  return text.replace(/\b(\d{1,2}):(\d{2})\b/g, (full, hStr, mStr) => {
    const hour = parseInt(hStr, 10);
    const minute = parseInt(mStr, 10);
    if (hour > 23 || minute > 59) {
      return full;
    }
    const period = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${h12}:${mStr} ${period}`;
  });
};
