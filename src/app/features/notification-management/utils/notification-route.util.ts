import {
  APP_PAYMENT_SHEETS_PATH,
  NOTIFICATION_PAYMENT_SHEET_PREFIX,
  NOTIFICATION_ROUTE_MAP,
} from '../constants/notification-route.constants';

/**
 * Turns a notification's server path into the app URL it means, keeping any query or hash.
 * Unknown paths are returned as they are.
 */
export function resolveNotificationRoute(
  route: string | null | undefined
): string | null {
  const raw = route?.trim();
  if (!raw) {
    return null;
  }

  const cut = raw.search(/[?#]/);
  const pathPart = cut === -1 ? raw : raw.slice(0, cut);
  const rest = cut === -1 ? '' : raw.slice(cut);
  const normalized =
    pathPart.length > 1 ? pathPart.replace(/\/+$/, '') : pathPart;

  const mapped = NOTIFICATION_ROUTE_MAP[normalized];
  if (mapped) {
    return mapped + rest;
  }

  if (normalized.startsWith(NOTIFICATION_PAYMENT_SHEET_PREFIX)) {
    const sheetId = normalized.slice(NOTIFICATION_PAYMENT_SHEET_PREFIX.length);
    return `${APP_PAYMENT_SHEETS_PATH}${sheetId}${rest}`;
  }

  return raw;
}
