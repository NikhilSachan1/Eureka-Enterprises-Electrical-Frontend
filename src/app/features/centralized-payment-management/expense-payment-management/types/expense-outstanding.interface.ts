import { IExpenseOutstandingGetBaseResponseDto } from './expense-outstanding.dto';

export interface IExpenseOutstanding
  extends Omit<
    IExpenseOutstandingGetBaseResponseDto,
    'userId' | 'userName' | 'employeeId'
  > {
  id: string;
  employeeName: string;
  employeeCode: string;
  transactionType?: 'credit' | 'debit';
  originalRawData: IExpenseOutstandingGetBaseResponseDto;
}
