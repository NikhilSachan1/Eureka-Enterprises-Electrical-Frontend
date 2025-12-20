import { z } from 'zod';
import { ExpenseForceRequestSchema } from './force-expense.schema';
import { EXPENSE_CATEGORY_DATA } from '@shared/config/static-data.config';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';

const { transactionId } = ExpenseForceRequestSchema.shape;

export const ExpenseReimburseRequestSchema = ExpenseForceRequestSchema.extend({
  category: z
    .enum(EXPENSE_CATEGORY_DATA.map(item => item.value))
    .default(
      getMappedValueFromArrayOfObjects(
        EXPENSE_CATEGORY_DATA,
        'settlement',
        'value',
        'value'
      )
    )
    .optional(),
  transactionId: transactionId.unwrap(),
});

export const ExpenseReimburseResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
