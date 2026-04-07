import { z } from 'zod';
import { ExpenseBaseSchema } from './base-expense.schema';

const { id, approvalStatus, approvalReason } = ExpenseBaseSchema.shape;

export const ExpenseActionRequestSchema = z
  .object({
    expenseIds: z.array(id),
    approvalStatus,
    remark: approvalReason,
  })
  .strict()
  .transform(data => {
    return {
      approvals: data.expenseIds.map(expenseId => ({
        expenseId,
        approvalStatus: data.approvalStatus,
        approvalComment: data.remark,
      })),
    };
  });

export const ExpenseActionResultSchema = z.looseObject({
  approvalStatus,
  message: z.string(),
  previousStatus: approvalStatus,
  expenseId: id,
});

export const ExpenseActionErrorSchema = z.looseObject({
  expenseId: id,
  error: z.string().min(1),
});

export const ExpenseActionResponseSchema = z.looseObject({
  message: z.string().min(1),
  result: z.array(ExpenseActionResultSchema),
  errors: z.array(ExpenseActionErrorSchema),
});
