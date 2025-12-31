import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const AssetDeleteRequestSchema = z
  .object({
    assetIds: z.array(uuidField).min(1),
  })
  .strict();

export const AssetDeleteResultSchema = z
  .object({
    assetId: uuidField,
    message: z.string(),
    previousStatus: z.string().min(1),
  })
  .strict();

export const AssetDeleteErrorSchema = z
  .object({
    assetId: uuidField,
    error: z.string().min(1),
  })
  .strict();

export const AssetDeleteResponseSchema = z
  .object({
    message: z.string(),
    result: z.array(AssetDeleteResultSchema),
    errors: z.array(AssetDeleteErrorSchema),
  })
  .strict();
