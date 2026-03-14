import { z } from 'zod';
import { FuelExpenseBaseSchema } from './base-fuel-expense.schema';

const { id, approvalStatus, approvalReason } = FuelExpenseBaseSchema.shape;

export const FuelExpenseActionRequestSchema = z
  .object({
    fuelExpenseIds: z.array(id),
    approvalStatus,
    remark: approvalReason,
  })
  .strict()
  .transform(data => {
    return {
      approvals: data.fuelExpenseIds.map(fuelExpenseId => ({
        fuelExpenseId,
        approvalStatus: data.approvalStatus,
        approvalReason: data.remark,
      })),
    };
  });

export const FuelExpenseActionResultSchema = z
  .object({
    fuelExpenseId: id,
    approvalStatus,
    message: z.string().optional(),
    previousStatus: approvalStatus.optional(),
  })
  .strict();

export const FuelExpenseActionErrorSchema = z
  .object({
    fuelExpenseId: id,
    error: z.string().min(1),
  })
  .strict();

export const FuelExpenseActionResponseSchema = z
  .object({
    message: z.string(),
    result: z.array(FuelExpenseActionResultSchema),
    errors: z.array(FuelExpenseActionErrorSchema),
  })
  .strict();
