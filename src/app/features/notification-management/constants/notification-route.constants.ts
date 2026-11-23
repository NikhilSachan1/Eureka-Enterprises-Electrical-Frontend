import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';

/**
 * The server names pages by its own paths (`/expenses`, `/fuel-expenses`, …), which are not the
 * app's routes. Each maps to the app page it means. Stored notifications keep the server path,
 * so the mapping lives here rather than being fixed only on the server.
 */
export const NOTIFICATION_ROUTE_MAP: Readonly<Record<string, string>> = {
  '/expenses': `/${ROUTE_BASE_PATHS.EXPENSE}`,
  '/fuel-expenses': `/${ROUTE_BASE_PATHS.TRANSPORT}/${ROUTE_BASE_PATHS.FUEL}`,
  '/attendance': `/${ROUTE_BASE_PATHS.ATTENDANCE}`,
  '/leaves': `/${ROUTE_BASE_PATHS.LEAVE}`,
  '/assets': `/${ROUTE_BASE_PATHS.ASSET}`,
  '/vehicles': `/${ROUTE_BASE_PATHS.TRANSPORT}/${ROUTE_BASE_PATHS.VEHICLE}`,
  '/cards': `/${ROUTE_BASE_PATHS.TRANSPORT}/${ROUTE_BASE_PATHS.PETRO_CARD}`,
  '/payroll': `/${ROUTE_BASE_PATHS.PAYROLL}`,
  '/dashboard': `/${ROUTE_BASE_PATHS.DASHBOARD}`,
  '/profile': `/${ROUTE_BASE_PATHS.EMPLOYEE}/${ROUTES.EMPLOYEE.MY_PROFILE}`,
};

/** Server `/payment-sheets/:id` → app payment sheet detail under the payment hub. */
export const NOTIFICATION_PAYMENT_SHEET_PREFIX = '/payment-sheets/';
export const APP_PAYMENT_SHEETS_PATH = `/${ROUTE_BASE_PATHS.PAYMENT_HUB}/${ROUTES.CENTRALIZED_PAYMENT.PAYMENT_SHEETS}/`;
