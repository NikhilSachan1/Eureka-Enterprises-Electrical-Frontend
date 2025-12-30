import { z } from 'zod';
import { AssetBaseSchema } from './base-asset.schema';
import { fileField, uuidField } from '@shared/schemas';

const { id } = AssetBaseSchema.shape;

export const ActionAssetRequestSchema = z
  .object({
    assetId: id,
    action: z.string().min(1),
    toUserId: uuidField.nullable(),
    assetFiles: z.array(fileField).nullable(),
    metadata: z.record(z.string(), z.string()),
  })
  .strict();

export const ActionAssetResponseSchema = z
  .object({
    message: z.string().min(1),
  })
  .strict();
