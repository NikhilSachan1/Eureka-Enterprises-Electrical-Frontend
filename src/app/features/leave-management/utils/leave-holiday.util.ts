import {
  ILeaveHoliday,
  ILeaveHolidaysGetResponseDto,
} from '../types/leave-holiday.dto';

const DAY_LABEL = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/** "2026-11-08" → local midnight of 8 Nov 2026 (what the date picker compares against). */
const toLocalDate = (isoDate: string): Date => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const toIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** Financial years ("2026-2027") a date range touches, so their holiday calendars can be loaded. */
export const financialYearsBetween = (from: Date, to: Date): string[] => {
  const startYear = (date: Date): number =>
    date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
  const years: string[] = [];
  for (let year = startYear(from); year <= startYear(to); year++) {
    years.push(`${year}-${year + 1}`);
  }
  return years;
};

export const toLeaveHolidays = (
  responses: ILeaveHolidaysGetResponseDto[]
): ILeaveHoliday[] =>
  responses
    .flatMap(response => response.holidays)
    .map(holiday => {
      const date = toLocalDate(holiday.date);
      return {
        isoDate: holiday.date,
        date,
        name: holiday.name || 'Holiday',
        label: DAY_LABEL.format(date),
      };
    })
    .sort((a, b) => a.isoDate.localeCompare(b.isoDate));

/** Holidays between two dates (inclusive). */
export const holidaysBetween = (
  holidays: ILeaveHoliday[],
  from: Date | null | undefined,
  to: Date | null | undefined
): ILeaveHoliday[] => {
  if (!from) {
    return [];
  }
  const start = toIsoDate(from);
  const end = toIsoDate(to ?? from);
  return holidays.filter(h => h.isoDate >= start && h.isoDate <= end);
};

/** Holidays inside the leave dates picked (a range [start, end] or one date). */
export const holidaysInLeaveRange = (
  holidays: ILeaveHoliday[],
  value: unknown
): ILeaveHoliday[] => {
  const [start, end] = Array.isArray(value) ? value : [value, value];
  return start instanceof Date
    ? holidaysBetween(holidays, start, end instanceof Date ? end : start)
    : [];
};

/** The message shown when the leave dates take in a holiday. */
export const holidayInRangeMessage = (holidays: ILeaveHoliday[]): string =>
  `Your leave dates include ${holidays
    .map(h => `${h.label} (${h.name})`)
    .join(
      ', '
    )}. Leave cannot be taken on a holiday — apply for the days before and after it separately.`;
