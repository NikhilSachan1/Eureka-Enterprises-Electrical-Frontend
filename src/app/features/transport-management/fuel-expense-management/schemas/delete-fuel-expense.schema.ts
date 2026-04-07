import z from 'zod';
import { FuelExpenseBaseSchema } from './base-fuel-expense.schema';

const { id, approvalStatus } = FuelExpenseBaseSchema.shape;

export const FuelExpenseDeleteRequestSchema = z
  .object({
    fuelExpenseIds: z.array(id),
  })
  .strict();

export const FuelExpenseDeleteResultSchema = z.looseObject({
  fuelExpenseId: id,
  message: z.string(),
  previousStatus: approvalStatus,
});

export const FuelExpenseDeleteErrorSchema = z.looseObject({
  fuelExpenseId: id,
  error: z.string().min(1),
});

export const FuelExpenseDeleteResponseSchema = z.looseObject({
  message: z.string(),
  result: z.array(FuelExpenseDeleteResultSchema),
  errors: z.array(FuelExpenseDeleteErrorSchema),
});
