import { z } from 'zod';
import { PoUpsertShapeSchema } from './base-po.schema';

export const ApprovePoRequestSchema = PoUpsertShapeSchema.pick({
  remarks: true,
})
  .strict()
  .transform(data => {
    return {
      reason: data.remarks,
    };
  });

export const ApprovePoResponseSchema = z.looseObject({
  message: z.string(),
});
