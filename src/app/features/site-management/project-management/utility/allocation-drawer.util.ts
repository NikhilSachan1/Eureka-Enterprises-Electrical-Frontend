import { APP_CONFIG } from '@core/config';
import { transformDateFormat } from '@shared/utility';

/** Helpers shared by the allocation drawers. */

export function daysLabel(days: number): string {
  return days === 1 ? '1 day' : `${days} days`;
}

/** "to Nov 8", with the year when the end falls in another year; "ongoing" while running. */
export function untilLabel(start: Date, end: Date | null): string {
  if (!end) {
    return 'ongoing';
  }
  const { DAY_MONTH, DEFAULT } = APP_CONFIG.DATE_FORMATS;
  const format =
    end.getFullYear() === start.getFullYear() ? DAY_MONTH : DEFAULT;
  return `to ${transformDateFormat(end, format)}`;
}

/** Up to two initials for an avatar. */
export function initialsOf(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
  return initials === '' ? '?' : initials;
}
