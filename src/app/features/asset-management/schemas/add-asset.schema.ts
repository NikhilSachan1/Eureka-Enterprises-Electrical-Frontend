import { z } from 'zod';
import { AssetBaseSchema } from './base-asset.schema';
import { fileField, onlyDateStringField } from '@shared/schemas';

export const AssetAddRequestSchema = AssetBaseSchema.omit({
  id: true,
  status: true,
  additionalData: true,
})
  .extend({
    purchaseDate: onlyDateStringField,
    warrantyStartDate: onlyDateStringField,
    warrantyEndDate: onlyDateStringField,
    calibrationStartDate: onlyDateStringField,
    calibrationEndDate: onlyDateStringField,
    assetFiles: z.array(fileField),
  })
  .strict();

export const AssetAddResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
