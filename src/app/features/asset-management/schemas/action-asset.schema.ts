import { z } from 'zod';
import { AssetBaseSchema } from './base-asset.schema';
import { fileField, uuidField } from '@shared/schemas';

const { id } = AssetBaseSchema.shape;

export const ActionAssetRequestSchema = z
  .object({
    assetId: id,
    actionType: z.string().min(1),
    allocatedToEmployeeName: uuidField.nullable(),
    assetImages: z.array(fileField).nullable(),
    remark: z.string().nullable(),
  })
  .strict()
  .transform(data => {
    return {
      assetId: data.assetId,
      action: data.actionType,
      toUserId: data.allocatedToEmployeeName,
      assetFiles: data.assetImages,
      metadata: {
        remark: data.remark,
      },
    };
  });

export const ActionAssetResponseSchema = z.looseObject({
  message: z.string().min(1),
});
