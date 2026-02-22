import {
  getRandomDate,
  getRandomNumber,
  createFileFromAsset,
  getRandomItem,
  TEST_PAYMENT_MODES,
  TEST_VEHICLE_LIST,
} from './mock-data.constants';
import { IFuelExpenseAddFormDto } from '@features/transport-management/fuel-expense-management/types/fuel-expense.dto';

// Filter out settlement from expense categories
export const ADD_FUEL_EXPENSE_PREFILLED_DATA: IFuelExpenseAddFormDto = {
  vehicleName: getRandomItem(TEST_VEHICLE_LIST) ?? '',
  cardName: null,
  transactionId: `TXN${getRandomNumber(10, 'exact')}`,
  fuelFillDate: getRandomDate(3, 2), // ~3 days old, ±2 days range
  odometerReading: getRandomNumber(5, 'upto'),
  fuelLiters: getRandomNumber(3, 'upto'),
  fuelAmount: getRandomNumber(5, 'upto'),
  paymentMode: getRandomItem(TEST_PAYMENT_MODES),
  remark: 'Fuel expense for official work',
  fuelExpenseAttachments: [
    createFileFromAsset('/mock-docs/fuel-expense/FUEL_EXPENSE_RECEIPT.pdf'),
  ],
};
