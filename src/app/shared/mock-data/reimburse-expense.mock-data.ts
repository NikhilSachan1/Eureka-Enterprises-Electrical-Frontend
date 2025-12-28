import { EMPLOYEE_NAME_DATA } from '@shared/config';
import {
  getRandomItemFromDropdown,
  getRandomDate,
  getRandomNumber,
  createFileFromAsset,
  TEST_PAYMENT_MODES,
  getRandomItem,
} from './mock-data.constants';

export const REIMBURSE_EXPENSE_PREFILLED_DATA: Record<string, unknown> = {
  employeeName: getRandomItemFromDropdown(EMPLOYEE_NAME_DATA),
  paymentMode: getRandomItem(TEST_PAYMENT_MODES),
  expenseDate: getRandomDate(15, 7), // ~15 days old, ±7 days range
  expenseAmount: getRandomNumber(4, 'upto'), // 0 to 9999
  transactionId: `TXN${getRandomNumber(10, 'exact')}`,
  description: 'Reimbursement for approved expense',
  attachment: [createFileFromAsset('/mock-docs/expense/EXPENSE_RECEIPT.pdf')],
};
