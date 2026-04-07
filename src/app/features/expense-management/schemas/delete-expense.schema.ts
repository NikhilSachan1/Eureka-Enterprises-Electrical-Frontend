import { z } from 'zod';
import { ExpenseBaseSchema } from './base-expense.schema';

const { id, approvalStatus } = ExpenseBaseSchema.shape;

export const ExpenseDeleteRequestSchema = z
  .object({
    expenseIds: z.array(id).min(1),
  })
  .strict();

export const ExpenseDeleteResultSchema = z.looseObject({
  expenseId: id,
  message: z.string(),
  previousStatus: approvalStatus,
});

export const ExpenseDeleteErrorSchema = z.looseObject({
  expenseId: id,
  error: z.string().min(1),
});

export const ExpenseDeleteResponseSchema = z.looseObject({
  message: z.string().min(1),
  result: z.array(ExpenseDeleteResultSchema),
  errors: z.array(ExpenseDeleteErrorSchema),
});
