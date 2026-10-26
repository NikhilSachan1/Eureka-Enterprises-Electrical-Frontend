import { ROUTE_BASE_PATHS } from '@shared/constants';

/**
 * Maps API `referenceType` to sidebar `basePath` keys that should show a badge.
 * Parent keys (e.g. transport) are included so aggregates roll up.
 */
export function menuKeysForReferenceType(
  referenceType: string | null | undefined
): string[] {
  switch ((referenceType ?? '').toLowerCase()) {
    case 'expense':
      return [ROUTE_BASE_PATHS.EXPENSE];
    case 'fuel_expense':
      return [ROUTE_BASE_PATHS.FUEL, ROUTE_BASE_PATHS.TRANSPORT];
    case 'attendance':
      return [ROUTE_BASE_PATHS.ATTENDANCE];
    case 'leave_application':
    case 'leave_balance':
      return [ROUTE_BASE_PATHS.LEAVE];
    case 'asset':
      return [ROUTE_BASE_PATHS.ASSET];
    case 'vehicle':
      return [ROUTE_BASE_PATHS.VEHICLE, ROUTE_BASE_PATHS.TRANSPORT];
    case 'card':
      return [ROUTE_BASE_PATHS.PETRO_CARD, ROUTE_BASE_PATHS.TRANSPORT];
    case 'payroll':
      return [ROUTE_BASE_PATHS.PAYROLL];
    case 'payment_sheet':
      return [ROUTE_BASE_PATHS.PAYMENT_HUB];
    default:
      return [];
  }
}

/** Build unread counts keyed by menu `basePath`. */
export function buildUnreadCountsByMenuKey(
  records: ReadonlyArray<{ referenceType?: string | null }>
): ReadonlyMap<string, number> {
  const counts = new Map<string, number>();
  for (const record of records) {
    for (const key of menuKeysForReferenceType(record.referenceType)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return counts;
}

export function formatMenuBadgeCount(count: number): string {
  if (count <= 0) {
    return '';
  }
  return count > 99 ? '99+' : String(count);
}
