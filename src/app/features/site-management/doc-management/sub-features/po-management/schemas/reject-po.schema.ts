import { z } from 'zod';
import { PoUpsertShapeSchema } from './base-po.schema';

export const RejectPoRequestSchema = PoUpsertShapeSchema.pick({
  remarks: true,
})
  .strict()
  .transform(data => {
    return {
      reason: data.remarks,
    };
  });

export const RejectPoResponseSchema = z.looseObject({
  message: z.string(),
});
