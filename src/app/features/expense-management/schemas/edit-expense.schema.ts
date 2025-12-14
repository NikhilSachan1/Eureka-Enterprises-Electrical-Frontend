import { z } from 'zod';
import { ExpenseAddRequestSchema } from './add-expense.schema';

export const ExpenseEditRequestSchema = ExpenseAddRequestSchema.strict();

export const ExpenseEditResponseSchema = z.object({
  message: z.string(),
});
