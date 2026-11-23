import { MS_PER_DAY } from '../constants/calendar-day.constants';

/**
 * Calendar-day arithmetic for timelines and day counts: a date is a whole local day, numbered so
 * that consecutive days differ by 1 (time of day and daylight saving never shift a count).
 */

/** The day number of a local date (its time of day is ignored). */
export function toDayNumber(value: Date): number {
  return (
    Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()) /
    MS_PER_DAY
  );
}

/** The local date of a day number. */
export function fromDayNumber(day: number): Date {
  const utc = new Date(day * MS_PER_DAY);
  return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
}

/** Parses an API date (`YYYY-MM-DD`, possibly with a time) as a local calendar date. */
export function parseCalendarDay(
  value: string | null | undefined
): Date | null {
  if (!value) {
    return null;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) {
    return null;
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}
