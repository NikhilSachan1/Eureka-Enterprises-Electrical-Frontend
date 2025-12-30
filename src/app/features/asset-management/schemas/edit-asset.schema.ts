import { z } from 'zod';
import { AssetAddRequestSchema } from './add-asset.schema';

export const AssetEditRequestSchema = AssetAddRequestSchema.omit({
  assetId: true,
}).strict();
export const AssetEditResponseSchema = z.object({
  message: z.string(),
});
