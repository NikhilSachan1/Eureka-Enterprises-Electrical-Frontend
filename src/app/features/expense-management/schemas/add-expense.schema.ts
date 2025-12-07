import { z } from 'zod';
import { ExpenseBaseSchema } from './base-expense.schema';
import { onlyDateStringField, fileField } from '@shared/schemas';

const { category, description, amount, paymentMode } = ExpenseBaseSchema.shape;

export const ExpenseAddRequestSchema = z
  .object({
    category,
    description,
    amount,
    expenseDate: onlyDateStringField,
    paymentMode,
    files: z.array(fileField),
  })
  .strict();

export const ExpenseAddResponseSchema = ExpenseBaseSchema.strict();
