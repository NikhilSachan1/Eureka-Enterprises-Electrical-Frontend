import { ExpenseAddResponseSchema } from './add-expense.schema';
import { uuidField } from '@shared/schemas';
import { ExpenseUpsertShapeSchema } from './base-expense.schema';
import { transformDateFormat } from '@shared/utility';

export const ExpenseForceRequestSchema = ExpenseUpsertShapeSchema.extend({
  employeeName: uuidField,
})
  .strict()
  .transform(data => {
    return {
      userId: data.employeeName,
      category: data.expenseCategory,
      description: data.remark,
      amount: data.expenseAmount,
      expenseDate: transformDateFormat(data.expenseDate),
      paymentMode: data.paymentMode,
      files: data.expenseAttachments,
      transactionId: data.transactionId,
    };
  });

export const ExpenseForceResponseSchema = ExpenseAddResponseSchema;
