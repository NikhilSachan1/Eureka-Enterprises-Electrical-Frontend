import { z } from 'zod';
import { JmcUpsertShapeSchema } from './base-jmc.schema';

export const UnlockRequestJmcRequestSchema = JmcUpsertShapeSchema.pick({
  remarks: true,
})
  .strict()
  .transform(data => {
    return {
      reason: data.remarks,
    };
  });

export const UnlockRequestJmcResponseSchema = z.looseObject({
  message: z.string(),
});
