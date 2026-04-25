/**
 * Calibration frequency options use values like `1_MONTH`, `12_MONTHS` (config / API).
 */
const CALIBRATION_FREQUENCY_MONTHS = /^(\d+)_MONTHS?$/i;

export function parseCalibrationFrequencyMonths(
  frequency: string | null | undefined
): number | null {
  if (!frequency?.trim()) {
    return null;
  }
  const match = CALIBRATION_FREQUENCY_MONTHS.exec(frequency.trim());
  if (!match) {
    return null;
  }
  const n = Number.parseInt(match[1], 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Adds whole calendar months, keeping day-of-month stable when possible. */
export function addCalendarMonths(base: Date, months: number): Date {
  const d = new Date(base.getTime());
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() < day) {
    d.setDate(0);
  }
  return d;
}

/**
 * API end date: start + N months from frequency (e.g. 12_MONTHS → +12 months).
 * If frequency cannot be parsed, returns a copy of `start` (same day).
 */
export function getCalibrationEndDateFromStartAndFrequency(
  start: Date,
  frequency: string | null | undefined
): Date {
  const months = parseCalibrationFrequencyMonths(frequency);
  if (months === null) {
    return new Date(start.getTime());
  }
  return addCalendarMonths(start, months);
}
