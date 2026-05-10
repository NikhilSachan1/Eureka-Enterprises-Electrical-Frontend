import { z } from 'zod';
import { JmcUpsertShapeSchema } from './base-jmc.schema';

export const RejectJmcRequestSchema = JmcUpsertShapeSchema.pick({
  remarks: true,
})
  .strict()
  .transform(data => {
    return {
      reason: data.remarks,
    };
  });

export const RejectJmcResponseSchema = z.looseObject({
  message: z.string(),
});
