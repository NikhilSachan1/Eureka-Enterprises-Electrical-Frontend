import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const CompanyDeleteRequestSchema = z
  .object({
    companyIds: z.array(uuidField).min(1),
  })
  .strict();

export const CompanyDeleteResultSchema = z.looseObject({
  id: uuidField,
  message: z.string(),
  success: z.boolean(),
});

export const CompanyDeleteResponseSchema = z.looseObject({
  message: z.string(),
  failureCount: z.number().int().nonnegative(),
  successCount: z.number().int().nonnegative(),
  totalRequested: z.number().int().nonnegative(),
  results: z.array(CompanyDeleteResultSchema),
});
