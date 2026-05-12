import { z } from 'zod';
import { JmcUpsertShapeSchema } from './base-jmc.schema';
import { transformDateFormat } from '@shared/utility/date-time.util';

export const EditJmcRequestSchema = JmcUpsertShapeSchema.omit({
  poNumber: true,
})
  .strict()
  .transform(data => {
    return {
      jmcNumber: data.jmcNumber,
      jmcDate: transformDateFormat(data.jmcDate),
      fileKey: data.jmcFileKey,
      fileName: data.jmcFileName,
      remarks: data.remarks,
    };
  });

export const EditJmcResponseSchema = z.looseObject({
  message: z.string(),
});
