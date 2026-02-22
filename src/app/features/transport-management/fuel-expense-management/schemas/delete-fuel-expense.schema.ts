import z from 'zod';
import { FuelExpenseBaseSchema } from './base-fuel-expense.schema';

const { id, approvalStatus } = FuelExpenseBaseSchema.shape;

export const FuelExpenseDeleteRequestSchema = z
  .object({
    fuelExpenseIds: z.array(id),
  })
  .strict();

export const FuelExpenseDeleteResultSchema = z
  .object({
    fuelExpenseId: id,
    message: z.string(),
    previousStatus: approvalStatus,
  })
  .strict();

export const FuelExpenseDeleteErrorSchema = z
  .object({
    fuelExpenseId: id,
    error: z.string().min(1),
  })
  .strict();

export const FuelExpenseDeleteResponseSchema = z
  .object({
    message: z.string(),
    result: z.array(FuelExpenseDeleteResultSchema),
    errors: z.array(FuelExpenseDeleteErrorSchema),
  })
  .strict();
