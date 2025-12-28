import {
  getRandomItemFromDropdown,
  getRandomDate,
  getRandomNumber,
  createFileFromAsset,
  getRandomItem,
  TEST_EXPENSE_CATEGORIES,
  TEST_PAYMENT_MODES,
} from './mock-data.constants';
import { EMPLOYEE_NAME_DATA } from '@shared/config';

export const FORCE_EXPENSE_PREFILLED_DATA: Record<string, unknown> = {
  employeeName: getRandomItemFromDropdown(EMPLOYEE_NAME_DATA),
  expenseType: getRandomItem(TEST_EXPENSE_CATEGORIES),
  paymentMode: getRandomItem(TEST_PAYMENT_MODES),
  expenseDate: getRandomDate(15, 7), // ~15 days old, ±7 days range
  expenseAmount: getRandomNumber(4, 'upto'), // 0 to 9999
  transactionId: `TXN${getRandomNumber(10, 'exact')}`,
  description: 'Forced expense entry for employee',
  attachment: [createFileFromAsset('/mock-docs/expense/EXPENSE_RECEIPT.pdf')],
};
