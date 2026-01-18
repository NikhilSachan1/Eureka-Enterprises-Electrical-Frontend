import { z } from 'zod';
import { EExpenseCategory } from '../types/expense.enum';
import { ExpenseUpsertShapeSchema } from './base-expense.schema';
import { uuidField } from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';

const { transactionId } = ExpenseUpsertShapeSchema.shape;

export const ExpenseReimburseRequestSchema = ExpenseUpsertShapeSchema.omit({
  expenseCategory: true,
})
  .extend({
    employeeName: uuidField,
    transactionId: transactionId.unwrap(),
  })
  .strict()
  .transform(data => {
    return {
      userId: data.employeeName,
      category: EExpenseCategory.SETTLEMENT,
      description: data.remark,
      amount: data.expenseAmount,
      expenseDate: transformDateFormat(data.expenseDate),
      paymentMode: data.paymentMode,
      files: data.expenseAttachments,
      transactionId: data.transactionId,
    };
  });

export const ExpenseReimburseResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
