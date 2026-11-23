/** Helpers shared by the allocation drawers. */

const DAY_MONTH = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
});
const DAY_MONTH_YEAR = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export function daysLabel(days: number): string {
  return days === 1 ? '1 day' : `${days} days`;
}

/** "to 8 Nov", with the year when the end falls in another year; "ongoing" while running. */
export function untilLabel(start: Date, end: Date | null): string {
  if (!end) {
    return 'ongoing';
  }
  const format =
    end.getFullYear() === start.getFullYear() ? DAY_MONTH : DAY_MONTH_YEAR;
  return `to ${format.format(end)}`;
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
