import { z } from 'zod';
import { uuidField } from '@shared/schemas';
import { ExpenseUpsertShapeSchema } from './base-expense.schema';
import { transformDateFormat } from '@shared/utility';

export const ExpenseAddRequestSchema = ExpenseUpsertShapeSchema.extend({
  employeeName: uuidField.nullable(),
})
  .strict()
  .transform(data => {
    return {
      ...(data.employeeName ? { userId: data.employeeName } : {}),
      category: data.expenseCategory,
      description: data.remark,
      amount: data.expenseAmount,
      expenseDate: transformDateFormat(data.expenseDate),
      paymentMode: data.paymentMode,
      files: data.expenseAttachments,
      transactionId: data.transactionId,
    };
  });

export const ExpenseAddResponseSchema = z.looseObject({
  message: z.string(),
});
