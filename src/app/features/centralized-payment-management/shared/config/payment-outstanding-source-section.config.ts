import { ICONS } from '@shared/constants';
import { ISectionHeaderConfig } from '@shared/types';

export enum EPaymentOutstandingSourceType {
  EXPENSE = 'EXPENSE',
  FUEL_EXPENSE = 'FUEL_EXPENSE',
  VENDOR_PAYMENT = 'VENDOR_PAYMENT',
}

export enum EPaymentOutstandingSectionContext {
  OUTSTANDING = 'OUTSTANDING',
  PAYMENT_SHEET = 'PAYMENT_SHEET',
}

export interface IPaymentOutstandingSourceSectionMeta {
  sectionConfig: ISectionHeaderConfig;
  recordCountUnit: string;
}

const OUTSTANDING_SUBTITLES: Record<EPaymentOutstandingSourceType, string> = {
  [EPaymentOutstandingSourceType.EXPENSE]:
    'Pending expense reimbursements to be paid.',
  [EPaymentOutstandingSourceType.FUEL_EXPENSE]:
    'Pending fuel reimbursements to be paid.',
  [EPaymentOutstandingSourceType.VENDOR_PAYMENT]:
    'Pending vendor payments to be paid.',
};

const PAYMENT_SHEET_SUBTITLES: Record<EPaymentOutstandingSourceType, string> = {
  [EPaymentOutstandingSourceType.EXPENSE]:
    'Employee expense reimbursements on this sheet.',
  [EPaymentOutstandingSourceType.FUEL_EXPENSE]:
    'Employee fuel reimbursements on this sheet.',
  [EPaymentOutstandingSourceType.VENDOR_PAYMENT]:
    'Vendor payments on this sheet.',
};

const SECTION_CONFIG_BY_SOURCE: Record<
  EPaymentOutstandingSourceType,
  Pick<ISectionHeaderConfig, 'title' | 'icon'>
> = {
  [EPaymentOutstandingSourceType.EXPENSE]: {
    title: 'Expense',
    icon: ICONS.EXPENSE.MONEY,
  },
  [EPaymentOutstandingSourceType.FUEL_EXPENSE]: {
    title: 'Fuel',
    icon: ICONS.FUEL.MENU,
  },
  [EPaymentOutstandingSourceType.VENDOR_PAYMENT]: {
    title: 'Vendor',
    icon: ICONS.SITE.BUILDING,
  },
};

const RECORD_COUNT_UNIT_BY_SOURCE: Record<
  EPaymentOutstandingSourceType,
  string
> = {
  [EPaymentOutstandingSourceType.EXPENSE]: 'employee',
  [EPaymentOutstandingSourceType.FUEL_EXPENSE]: 'employee',
  [EPaymentOutstandingSourceType.VENDOR_PAYMENT]: 'vendor',
};

export function getPaymentOutstandingSourceSectionMeta(
  sourceType: EPaymentOutstandingSourceType,
  context: EPaymentOutstandingSectionContext = EPaymentOutstandingSectionContext.OUTSTANDING
): IPaymentOutstandingSourceSectionMeta {
  const subtitles =
    context === EPaymentOutstandingSectionContext.PAYMENT_SHEET
      ? PAYMENT_SHEET_SUBTITLES
      : OUTSTANDING_SUBTITLES;

  return {
    sectionConfig: {
      ...SECTION_CONFIG_BY_SOURCE[sourceType],
      subtitle: subtitles[sourceType],
    },
    recordCountUnit: RECORD_COUNT_UNIT_BY_SOURCE[sourceType],
  };
}

export function isPaymentOutstandingRowSelectionDisabled(
  row: Record<string, unknown>,
  excludedUserIds: ReadonlySet<string> = new Set()
): boolean {
  const pendingAmount = Number(row['pendingAmount'] ?? 0);

  if (pendingAmount <= 0) {
    return true;
  }

  return excludedUserIds.has(String(row['userId'] ?? ''));
}
