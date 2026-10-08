import { ICONS } from '@shared/constants';
import { EPaymentOutstandingSourceType } from '../config/payment-outstanding-source-section.config';

const PAYMENT_SOURCE_TAB_LABELS: Record<EPaymentOutstandingSourceType, string> =
  {
    [EPaymentOutstandingSourceType.EXPENSE]: 'Expense',
    [EPaymentOutstandingSourceType.FUEL_EXPENSE]: 'Fuel expense',
    [EPaymentOutstandingSourceType.VENDOR_PAYMENT]: 'Vendors',
    [EPaymentOutstandingSourceType.PETRO_CARD_WALLET]: 'Wallet',
  };

export function getPaymentSourceTabLabel(
  sourceType: EPaymentOutstandingSourceType
): string {
  return PAYMENT_SOURCE_TAB_LABELS[sourceType];
}

export function getPaymentSourceTabIcon(
  sourceType: EPaymentOutstandingSourceType
): string {
  if (sourceType === EPaymentOutstandingSourceType.EXPENSE) {
    return ICONS.EXPENSE.MONEY;
  }

  if (sourceType === EPaymentOutstandingSourceType.FUEL_EXPENSE) {
    return ICONS.FUEL.MENU;
  }

  if (sourceType === EPaymentOutstandingSourceType.PETRO_CARD_WALLET) {
    return ICONS.PAYROLL.WALLET;
  }

  return ICONS.SITE.BUILDING;
}

export function getPaymentSourceTabAccent(
  sourceType: EPaymentOutstandingSourceType
): {
  light: string;
  dark: string;
} {
  if (sourceType === EPaymentOutstandingSourceType.EXPENSE) {
    return { light: '#059669', dark: '#047857' };
  }

  if (sourceType === EPaymentOutstandingSourceType.FUEL_EXPENSE) {
    return { light: '#d97706', dark: '#b45309' };
  }

  if (sourceType === EPaymentOutstandingSourceType.PETRO_CARD_WALLET) {
    return { light: '#0d9488', dark: '#0f766e' };
  }

  return { light: '#2563eb', dark: '#1d4ed8' };
}
