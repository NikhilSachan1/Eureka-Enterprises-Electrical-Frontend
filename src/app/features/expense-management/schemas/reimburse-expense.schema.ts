import { z } from 'zod';
import { ExpenseForceRequestSchema } from './force-expense.schema';

const { transactionId } = ExpenseForceRequestSchema.shape;

export const ExpenseReimburseRequestSchema = ExpenseForceRequestSchema.extend({
  transactionId: transactionId.unwrap(),
});

export const ExpenseReimburseResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
