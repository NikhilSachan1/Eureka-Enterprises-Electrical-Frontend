import * as z from 'zod';
import { fileField } from '@shared/schemas';

/** POST assets/:assetMasterId/mark-lost (multipart). */
export const MarkLostAssetRequestSchema = z
  .object({
    lostReason: z.string().trim().min(1).max(1000),
    recoveryAmount: z.number().min(0).nullable(),
    assetImages: z.array(fileField).min(1),
  })
  .strict()
  .transform(data => ({
    reason: data.lostReason,
    recoveryAmount: String(data.recoveryAmount ?? 0),
    assetFiles: data.assetImages,
  }));

/** POST assets/:assetMasterId/mark-recovered (multipart). */
export const MarkRecoveredAssetRequestSchema = z
  .object({
    recoveryNotes: z.string().trim().min(1).max(1000),
    refundRecoveryAmount: z.boolean().nullable(),
    assetImages: z.array(fileField).nullable(),
  })
  .strict()
  .transform(data => ({
    notes: data.recoveryNotes,
    refundRecoveryAmount: !!data.refundRecoveryAmount,
    assetFiles: data.assetImages,
  }));

export const LostRecoveryAssetResponseSchema = z.looseObject({
  message: z.string().min(1),
});
