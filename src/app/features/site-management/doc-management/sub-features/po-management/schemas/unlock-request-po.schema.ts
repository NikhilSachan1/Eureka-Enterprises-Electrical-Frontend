import { z } from 'zod';
import { PoUpsertShapeSchema } from './base-po.schema';

export const UnlockRequestPoRequestSchema = PoUpsertShapeSchema.pick({
  remarks: true,
})
  .strict()
  .transform(data => {
    return {
      reason: data.remarks,
    };
  });

export const UnlockRequestPoResponseSchema = z.looseObject({
  message: z.string(),
});
