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

export const ExpenseActionResultSchema = z
  .object({
    approvalStatus,
    message: z.string(),
    previousStatus: approvalStatus,
    expenseId: id,
  })
  .strict();

export const ExpenseActionErrorSchema = z
  .object({
    expenseId: id,
    error: z.string().min(1),
  })
  .strict();

export const ExpenseActionResponseSchema = z
  .object({
    message: z.string().min(1),
    result: z.array(ExpenseActionResultSchema),
    errors: z.array(ExpenseActionErrorSchema),
  })
  .strict();
