import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const CompanyDeleteRequestSchema = z
  .object({
    companyIds: z.array(uuidField).min(1),
  })
  .strict();

export const CompanyDeleteResultSchema = z
  .object({
    id: uuidField,
    message: z.string(),
    success: z.boolean(),
  })
  .strict();

export const CompanyDeleteResponseSchema = z
  .object({
    message: z.string(),
    failureCount: z.number().int().nonnegative(),
    successCount: z.number().int().nonnegative(),
    totalRequested: z.number().int().nonnegative(),
    results: z.array(CompanyDeleteResultSchema),
  })
  .strict();
