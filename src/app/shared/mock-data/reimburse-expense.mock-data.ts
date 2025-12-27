import {
  getRandomItemFromDropdown,
  getRandomDate,
  getRandomNumber,
  createFileFromAsset,
} from './mock-data.constants';
import {
  EXPENSE_PAYMENT_METHOD_DATA,
  EMPLOYEE_NAME_DATA,
} from '@shared/config/static-data.config';

export const REIMBURSE_EXPENSE_PREFILLED_DATA: Record<string, unknown> = {
  employeeName: getRandomItemFromDropdown(EMPLOYEE_NAME_DATA),
  paymentMode: getRandomItemFromDropdown(EXPENSE_PAYMENT_METHOD_DATA),
  expenseDate: getRandomDate(15, 7), // ~15 days old, ±7 days range
  expenseAmount: getRandomNumber(4, 'upto'), // 0 to 9999
  transactionId: `TXN${getRandomNumber(10, 'exact')}`,
  description: 'Reimbursement for approved expense',
  attachment: [createFileFromAsset('/mock-docs/expense/EXPENSE_RECEIPT.pdf')],
};
