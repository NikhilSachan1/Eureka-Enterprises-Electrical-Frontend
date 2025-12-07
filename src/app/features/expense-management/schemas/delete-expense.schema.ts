import { z } from 'zod';
import { ExpenseBaseSchema } from './base-expense.schema';

const { id } = ExpenseBaseSchema.shape;

export const ExpenseDeleteRequestSchema = z
  .object({
    id,
  })
  .strict();

export const ExpenseDeleteResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
