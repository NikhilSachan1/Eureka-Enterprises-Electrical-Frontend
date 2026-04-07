import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const AssetDeleteRequestSchema = z
  .object({
    assetIds: z.array(uuidField).min(1),
  })
  .strict();

export const AssetDeleteResultSchema = z.looseObject({
  assetId: uuidField,
  message: z.string(),
  previousStatus: z.string().min(1),
});

export const AssetDeleteErrorSchema = z.looseObject({
  assetId: uuidField,
  error: z.string().min(1),
});

export const AssetDeleteResponseSchema = z.looseObject({
  message: z.string(),
  result: z.array(AssetDeleteResultSchema),
  errors: z.array(AssetDeleteErrorSchema),
});
