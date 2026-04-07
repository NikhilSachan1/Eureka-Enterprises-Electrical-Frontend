import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const ContractorDeleteRequestSchema = z
  .object({
    contractorIds: z.array(uuidField).min(1),
  })
  .strict();

export const ContractorDeleteResultSchema = z.looseObject({
  id: uuidField,
  message: z.string(),
  success: z.boolean(),
});

export const ContractorDeleteResponseSchema = z.looseObject({
  message: z.string(),
  failureCount: z.number().int().nonnegative(),
  successCount: z.number().int().nonnegative(),
  totalRequested: z.number().int().nonnegative(),
  results: z.array(ContractorDeleteResultSchema),
});
