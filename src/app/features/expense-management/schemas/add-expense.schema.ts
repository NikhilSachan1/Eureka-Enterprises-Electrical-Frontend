import { z } from 'zod';
import { onlyDateStringField, fileField } from '@shared/schemas';
import { ExpenseGetBaseResponseSchema } from './get-expense.schema';

const { category, description, amount, paymentMode } =
  ExpenseGetBaseResponseSchema.shape;

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

export const ExpenseAddResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
