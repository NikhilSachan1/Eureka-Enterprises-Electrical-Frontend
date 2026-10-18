import { APP_CONFIG } from '@core/config';

export function shouldCapWalletBalanceDisplay(
  amount: number,
  capForViewer: boolean
): boolean {
  return (
    capForViewer &&
    Number.isFinite(amount) &&
    amount > APP_CONFIG.WALLET_CONFIG.EMPLOYEE_DISPLAY_CAP
  );
}

export function formatWalletBalanceAmount(amount: number): string {
  return new Intl.NumberFormat(APP_CONFIG.NUMBER_FORMATS.LOCALE, {
    style: 'currency',
    currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Exact balance unless the viewer has the cap permission and the amount is above the cap. */
export function formatWalletBalanceForViewer(
  amount: number,
  capForViewer: boolean
): string {
  if (!shouldCapWalletBalanceDisplay(amount, capForViewer)) {
    return formatWalletBalanceAmount(amount);
  }

  const capped = new Intl.NumberFormat(APP_CONFIG.NUMBER_FORMATS.LOCALE, {
    style: 'currency',
    currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(APP_CONFIG.WALLET_CONFIG.EMPLOYEE_DISPLAY_CAP);

  return `${capped}+`;
}
