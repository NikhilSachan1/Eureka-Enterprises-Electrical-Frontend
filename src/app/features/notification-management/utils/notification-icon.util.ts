import { ICONS } from '@shared/constants';

/** Maps API `referenceType` to a PrimeIcons class for the bell list. */
export function getNotificationReferenceIcon(
  referenceType: string | null | undefined
): string {
  switch ((referenceType ?? '').toLowerCase()) {
    case 'expense':
    case 'fuel_expense':
      return ICONS.COMMON.BRIEFCASE;
    case 'attendance':
      return ICONS.COMMON.CLOCK;
    case 'leave_application':
    case 'leave_balance':
      return ICONS.COMMON.CALENDAR;
    case 'asset':
      return ICONS.ASSET.BOX;
    case 'vehicle':
      return ICONS.COMMON.CAR;
    case 'card':
      return ICONS.COMMON.CREDIT_CARD;
    case 'payroll':
      return ICONS.COMMON.FILE;
    case 'payment_sheet':
      return ICONS.COMMON.BOOK;
    case 'celebration':
      return ICONS.COMMON.GIFT;
    case 'fnf':
      return ICONS.COMMON.USERS;
    default:
      return ICONS.COMMON.BELL;
  }
}
