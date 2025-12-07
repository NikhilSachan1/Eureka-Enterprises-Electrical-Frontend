import { IExpenseGetBaseResponseDto } from './expense.dto';

export interface IExpense
  extends Omit<
    IExpenseGetBaseResponseDto,
    | 'userId'
    | 'description'
    | 'transactionId'
    | 'approvalBy'
    | 'approvalAt'
    | 'approvalReason'
    | 'paymentMode'
    | 'entrySourceType'
    | 'expenseEntryType'
    | 'updatedAt'
    | 'createdAt'
    | 'approvalByUser'
    | 'user'
    | 'deletedBy'
    | 'deletedAt'
    | 'createdBy'
    | 'updatedBy'
    | 'createdAt'
    | 'updatedAt'
    | 'amount'
    | 'category'
  > {
  employeeName: string;
  employeeCode: string;
  expenseAmount: number;
  expenseType: string;
}
