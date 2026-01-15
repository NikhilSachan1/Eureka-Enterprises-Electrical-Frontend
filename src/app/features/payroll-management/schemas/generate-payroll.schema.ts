import { z } from 'zod';
import { dateField, uuidField } from '@shared/schemas';

export const GeneratePayrollRequestSchema = z
  .object({
    employeeNames: z.array(uuidField),
    monthYear: dateField,
  })
  .strict()
  .transform(data => {
    return {
      userIds: data.employeeNames,
      month: data.monthYear.getMonth() + 1,
      year: data.monthYear.getFullYear(),
    };
  });

export const GeneratePayrollResponseSchema = z
  .object({
    message: z.string().min(1),
    success: z.number(),
    failed: z.number(),
    skipped: z.number(),
    errors: z.array(
      z.object({
        userId: uuidField,
        error: z.string().min(1),
      })
    ),
  })
  .strict();
