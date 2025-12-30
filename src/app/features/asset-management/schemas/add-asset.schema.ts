import { z } from 'zod';
import { AssetBaseSchema } from './base-asset.schema';
import { AuditSchema, fileField, onlyDateStringField } from '@shared/schemas';

export const AssetAddRequestSchema = AssetBaseSchema.omit({
  id: true,
  status: true,
  calibrationStatus: true,
  warrantyStatus: true,
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

export const AssetAddResponseSchema = AssetBaseSchema.pick({
  assetId: true,
  id: true,
})
  .extend({
    ...AuditSchema.shape,
  })
  .strict();
