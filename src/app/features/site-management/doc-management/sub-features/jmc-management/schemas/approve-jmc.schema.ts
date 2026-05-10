import { z } from 'zod';
import { JmcUpsertShapeSchema } from './base-jmc.schema';

export const ApproveJmcRequestSchema = JmcUpsertShapeSchema.pick({
  remarks: true,
})
  .strict()
  .transform(data => {
    return {
      reason: data.remarks,
    };
  });

export const ApproveJmcResponseSchema = z.looseObject({
  message: z.string(),
});
