import { ICONS } from '@shared/constants';
import { EPaymentOutstandingSourceType } from '../config/payment-outstanding-source-section.config';

const PAYMENT_SOURCE_TAB_LABELS: Record<EPaymentOutstandingSourceType, string> =
  {
    [EPaymentOutstandingSourceType.EXPENSE]: 'Expense',
    [EPaymentOutstandingSourceType.FUEL_EXPENSE]: 'Fuel expense',
    [EPaymentOutstandingSourceType.VENDOR_PAYMENT]: 'Vendors',
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

  return { light: '#2563eb', dark: '#1d4ed8' };
}
