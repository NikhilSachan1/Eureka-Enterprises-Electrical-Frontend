import { z } from 'zod';
import { ExpenseForceRequestSchema } from './force-expense.schema';
import { EExpenseCategory } from '../types/expense.enum';

const { transactionId } = ExpenseForceRequestSchema.shape;

export const ExpenseReimburseRequestSchema = ExpenseForceRequestSchema.extend({
  category: z.string().min(1).default(EExpenseCategory.SETTLEMENT).optional(),
  transactionId: transactionId.unwrap(),
});

export const ExpenseReimburseResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
