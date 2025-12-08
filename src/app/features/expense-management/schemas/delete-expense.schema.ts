import { z } from 'zod';
import { ExpenseBaseSchema } from './base-expense.schema';

const { id, approvalStatus } = ExpenseBaseSchema.shape;

export const ExpenseDeleteRequestSchema = z
  .object({
    expenseIds: z.array(id).min(1),
  })
  .strict();

export const ExpenseDeleteResultSchema = z
  .object({
    expenseId: id,
    message: z.string(),
    previousStatus: approvalStatus,
  })
  .strict();

export const ExpenseDeleteErrorSchema = z
  .object({
    expenseId: id,
    error: z.string().min(1),
  })
  .strict();

export const ExpenseDeleteResponseSchema = z
  .object({
    message: z.string().min(1),
    result: z.array(ExpenseDeleteResultSchema),
    errors: z.array(ExpenseDeleteErrorSchema),
  })
  .strict();
