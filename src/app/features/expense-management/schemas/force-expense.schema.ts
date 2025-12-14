import {
  ExpenseAddRequestSchema,
  ExpenseAddResponseSchema,
} from './add-expense.schema';
import { uuidField } from '@shared/schemas';

export const ExpenseForceRequestSchema = ExpenseAddRequestSchema.extend({
  userId: uuidField,
});

export const ExpenseForceResponseSchema = ExpenseAddResponseSchema.strict();
