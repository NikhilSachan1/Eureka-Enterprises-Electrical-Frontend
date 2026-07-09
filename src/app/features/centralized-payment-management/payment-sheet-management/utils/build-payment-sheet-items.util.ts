import { IExpenseOutstandingGetBaseResponseDto } from '@features/centralized-payment-management/expense-payment-management/types/expense-outstanding.dto';
import { IFuelExpenseOutstandingGetBaseResponseDto } from '@features/centralized-payment-management/fuel-expense-payment-management/types/fuel-expense-outstanding.dto';
import { IVendorBookPaymentTableRow } from '@features/centralized-payment-management/vendor-payment-management/types/vendor-outstanding.interface';
import { IAddPaymentSheetItemsFormDto } from '../types/payment-sheet.dto';
import {
  EPaymentSheetBeneficiaryType,
  EPaymentSheetSourceType,
} from '../types/payment-sheet.enum';

export function buildPaymentSheetItemsFromOutstanding(
  expenseRecords: IExpenseOutstandingGetBaseResponseDto[],
  fuelRecords: IFuelExpenseOutstandingGetBaseResponseDto[],
  vendorBookPayments: IVendorBookPaymentTableRow[] = []
): IAddPaymentSheetItemsFormDto['items'] {
  const expenseItems = expenseRecords.map(record => ({
    beneficiaryType: EPaymentSheetBeneficiaryType.USER,
    userId: record.userId,
    sourceType: EPaymentSheetSourceType.EXPENSE,
    requestedAmount: record.pendingAmount,
  }));

  const fuelItems = fuelRecords.map(record => ({
    beneficiaryType: EPaymentSheetBeneficiaryType.USER,
    userId: record.userId,
    sourceType: EPaymentSheetSourceType.FUEL_EXPENSE,
    requestedAmount: record.pendingAmount,
  }));

  const vendorGroups = new Map<string, IVendorBookPaymentTableRow[]>();

  for (const bookPayment of vendorBookPayments) {
    const existing = vendorGroups.get(bookPayment.vendorId) ?? [];
    existing.push(bookPayment);
    vendorGroups.set(bookPayment.vendorId, existing);
  }

  const vendorItems = Array.from(vendorGroups.entries()).map(
    ([vendorId, bookPayments]) => ({
      beneficiaryType: EPaymentSheetBeneficiaryType.VENDOR,
      vendorId,
      sourceType: EPaymentSheetSourceType.VENDOR_PAYMENT,
      bookPaymentIds: bookPayments.map(bookPayment => bookPayment.id),
    })
  );

  return [...expenseItems, ...fuelItems, ...vendorItems];
}
