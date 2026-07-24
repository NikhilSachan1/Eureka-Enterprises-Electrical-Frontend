import { z } from 'zod';
import { JmcUpsertShapeSchema } from './base-jmc.schema';
import { transformDateFormat } from '@shared/utility/date-time.util';

export const EditJmcRequestSchema = JmcUpsertShapeSchema.omit({
  poNumber: true,
})
  .strict()
  .transform(data => {
    const payload = {
      jmcNumber: data.jmcNumber,
      jmcDate: transformDateFormat(data.jmcDate),
      fileKey: data.jmcFileKey,
      fileName: data.jmcFileName,
      remarks: data.remarks,
      ...(data.items !== null && data.items !== undefined
        ? { items: data.items }
        : {}),
    };
    return payload;
  });

export const EditJmcResponseSchema = z.looseObject({
  message: z.string(),
});
