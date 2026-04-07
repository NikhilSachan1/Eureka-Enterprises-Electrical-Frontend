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

export const FuelExpenseActionResultSchema = z.looseObject({
  approvalStatus,
  message: z.string(),
  previousStatus: approvalStatus,
  fuelExpenseId: id,
});

export const FuelExpenseActionErrorSchema = z.looseObject({
  fuelExpenseId: id,
  error: z.string().min(1),
});

export const FuelExpenseActionResponseSchema = z.looseObject({
  message: z.string(),
  result: z.array(FuelExpenseActionResultSchema),
  errors: z.array(FuelExpenseActionErrorSchema),
});
