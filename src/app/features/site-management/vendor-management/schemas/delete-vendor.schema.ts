import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const VendorDeleteRequestSchema = z
  .object({
    vendorIds: z.array(uuidField).min(1),
  })
  .strict();

export const VendorDeleteResultSchema = z.looseObject({
  id: uuidField,
  message: z.string(),
  success: z.boolean(),
});

export const VendorDeleteResponseSchema = z.looseObject({
  message: z.string(),
  failureCount: z.number().int().nonnegative(),
  successCount: z.number().int().nonnegative(),
  totalRequested: z.number().int().nonnegative(),
  results: z.array(VendorDeleteResultSchema),
});
