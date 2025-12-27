import {
  getRandomItemFromDropdown,
  getRandomDate,
  getRandomNumber,
  createFileFromAsset,
} from './mock-data.constants';
import {
  EXPENSE_CATEGORY_DATA,
  EXPENSE_PAYMENT_METHOD_DATA,
} from '@shared/config/static-data.config';

// Filter out settlement from expense categories
const VALID_EXPENSE_CATEGORIES = EXPENSE_CATEGORY_DATA.filter(
  category => category.value !== 'settlement'
);

export const ADD_EXPENSE_PREFILLED_DATA: Record<string, unknown> = {
  expenseType: getRandomItemFromDropdown(VALID_EXPENSE_CATEGORIES),
  paymentMode: getRandomItemFromDropdown(EXPENSE_PAYMENT_METHOD_DATA),
  expenseDate: getRandomDate(3, 2), // ~3 days old, ±2 days range
  expenseAmount: getRandomNumber(4, 'upto'), // 0 to 9999
  transactionId: `TXN${getRandomNumber(10, 'exact')}`,
  description: 'Business expense for official work',
  attachment: [createFileFromAsset('/mock-docs/expense/EXPENSE_RECEIPT.pdf')],
};
