import { IExpenseAddFormDto } from '@features/expense-management/types/expense.dto';
import {
  getRandomDate,
  getRandomNumber,
  createFileFromAsset,
  getRandomItem,
  TEST_EXPENSE_CATEGORIES,
  TEST_PAYMENT_MODES,
} from './mock-data.constants';

// Filter out settlement from expense categories
export const ADD_EXPENSE_PREFILLED_DATA: IExpenseAddFormDto = {
  expenseCategory: getRandomItem(TEST_EXPENSE_CATEGORIES),
  paymentMode: getRandomItem(TEST_PAYMENT_MODES),
  expenseDate: getRandomDate(3, 2), // ~3 days old, ±2 days range
  expenseAmount: getRandomNumber(4, 'upto'), // 0 to 9999
  transactionId: `TXN${getRandomNumber(10, 'exact')}`,
  remark: 'Business expense for official work',
  expenseAttachments: [
    createFileFromAsset('/mock-docs/expense/EXPENSE_RECEIPT.pdf'),
  ],
};
