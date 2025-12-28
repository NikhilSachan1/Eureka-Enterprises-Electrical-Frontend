import {
  getRandomDate,
  getRandomNumber,
  createFileFromAsset,
  getRandomItem,
  TEST_EXPENSE_CATEGORIES,
  TEST_PAYMENT_MODES,
  TEST_EMPLOYEE_LIST,
} from './mock-data.constants';

export const FORCE_EXPENSE_PREFILLED_DATA: Record<string, unknown> = {
  employeeName: getRandomItem(TEST_EMPLOYEE_LIST),
  expenseType: getRandomItem(TEST_EXPENSE_CATEGORIES),
  paymentMode: getRandomItem(TEST_PAYMENT_MODES),
  expenseDate: getRandomDate(15, 7), // ~15 days old, ±7 days range
  expenseAmount: getRandomNumber(4, 'upto'), // 0 to 9999
  transactionId: `TXN${getRandomNumber(10, 'exact')}`,
  description: 'Forced expense entry for employee',
  attachment: [createFileFromAsset('/mock-docs/expense/EXPENSE_RECEIPT.pdf')],
};
