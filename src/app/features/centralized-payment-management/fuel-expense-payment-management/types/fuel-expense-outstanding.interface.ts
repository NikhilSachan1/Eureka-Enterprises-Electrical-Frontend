import { IFuelExpenseOutstandingGetBaseResponseDto } from './fuel-expense-outstanding.dto';

export interface IFuelExpenseOutstanding
  extends Omit<
    IFuelExpenseOutstandingGetBaseResponseDto,
    'userId' | 'userName' | 'employeeId'
  > {
  id: string;
  employeeName: string;
  employeeCode: string;
  transactionType?: 'credit' | 'debit';
  originalRawData: IFuelExpenseOutstandingGetBaseResponseDto;
}
