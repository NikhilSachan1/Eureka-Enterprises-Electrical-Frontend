import { z } from 'zod';
import { onlyDateStringField, uuidField } from '@shared/schemas';

export const SalaryIncrementAddRequestSchema = z
  .object({
    userId: uuidField,
    basic: z.number(),
    hra: z.number(),
    tds: z.number(),
    esic: z.number(),
    employeePf: z.number(),
    employerPf: z.number(),
    foodAllowance: z.number(),
    remark: z.string(),
    effectiveFrom: onlyDateStringField,
  })
  .strict();

export const SalaryIncrementAddResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
