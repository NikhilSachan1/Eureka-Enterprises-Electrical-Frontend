import { z } from 'zod';
import { ExpenseUpsertShapeSchema } from './base-expense.schema';
import { transformDateFormat } from '@shared/utility';

export const ExpenseEditRequestSchema =
  ExpenseUpsertShapeSchema.strict().transform(data => {
    return {
      category: data.expenseCategory,
      description: data.remark,
      amount: data.expenseAmount,
      expenseDate: transformDateFormat(data.expenseDate),
      paymentMode: data.paymentMode,
      files: data.expenseAttachments,
      transactionId: data.transactionId,
    };
  });

export const ExpenseEditResponseSchema = z.object({
  message: z.string(),
});
