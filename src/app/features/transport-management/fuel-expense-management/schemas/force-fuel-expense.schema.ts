import { uuidField } from '@shared/schemas';
import { FuelExpenseUpsertShapeSchema } from './base-fuel-expense.schema';
import z from 'zod';

export const FuelExpenseForceRequestSchema =
  FuelExpenseUpsertShapeSchema.extend({
    employeeName: uuidField,
  })
    .strict()
    .transform(data => {
      return {
        userId: data.employeeName,
      };
    });

export const FuelExpenseForceResponseSchema = z.looseObject({
  message: z.string(),
});
