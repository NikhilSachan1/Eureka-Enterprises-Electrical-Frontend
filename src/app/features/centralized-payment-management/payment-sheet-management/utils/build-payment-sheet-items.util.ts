import { IExpenseOutstandingGetBaseResponseDto } from '@features/centralized-payment-management/expense-payment-management/types/expense-outstanding.dto';
import { IFuelExpenseOutstandingGetBaseResponseDto } from '@features/centralized-payment-management/fuel-expense-payment-management/types/fuel-expense-outstanding.dto';
import { IAddPaymentSheetItemsFormDto } from '../types/payment-sheet.dto';
import {
  EPaymentSheetBeneficiaryType,
  EPaymentSheetSourceType,
} from '../types/payment-sheet.enum';

export function buildPaymentSheetItemsFromOutstanding(
  expenseRecords: IExpenseOutstandingGetBaseResponseDto[],
  fuelRecords: IFuelExpenseOutstandingGetBaseResponseDto[]
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

  return [...expenseItems, ...fuelItems];
}
