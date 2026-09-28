import { z } from 'zod';
import { JmcUpsertShapeSchema } from './base-jmc.schema';
import { transformDateFormat } from '@shared/utility/date-time.util';

export const EditJmcRequestSchema = JmcUpsertShapeSchema.omit({
  poNumber: true,
})
  .strict()
  .transform(data => {
    const isNoJmc = Boolean(data.isNoJmc);
    const payload = {
      ...(isNoJmc ? { noJmc: true as const } : {}),
      jmcNumber: isNoJmc ? null : data.jmcNumber,
      jmcDate:
        isNoJmc || !data.jmcDate ? null : transformDateFormat(data.jmcDate),
      fileKey: isNoJmc ? null : data.jmcFileKey,
      fileName: isNoJmc ? null : data.jmcFileName,
      remarks: data.remarks,
      ...(data.items !== null && data.items !== undefined && !isNoJmc
        ? { items: data.items }
        : {}),
    };
    return payload;
  });

export const EditJmcResponseSchema = z.looseObject({
  message: z.string(),
});
