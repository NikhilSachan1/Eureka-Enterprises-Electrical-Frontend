import { z } from 'zod';
import { uuidField } from '@shared/schemas';
import { EPayslipStatus } from '../types/payroll.enum';

export const ActionPayrollRequestSchema = z
  .object({
    payrollIds: z.array(uuidField),
    actionName: z.enum(EPayslipStatus).nullable().optional(),
    comment: z.string().nullable().optional(),
  })
  .strict()
  .transform(data => {
    return {
      payrollIds: data.payrollIds,
      targetStatus: data.actionName,
      reason: data.comment ?? undefined,
    };
  });

export const ActionPayrollResponseSchema = z
  .object({
    message: z.string().min(1),
    success: z.number(),
    failed: z.number(),
    errors: z.array(
      z.object({
        id: uuidField,
        error: z.string().min(1),
      })
    ),
  })
  .strict();
