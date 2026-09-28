import { z } from 'zod';
import { JmcUpsertShapeSchema } from './base-jmc.schema';
import { transformDateFormat } from '@shared/utility/date-time.util';

export const AddJmcRequestSchema = JmcUpsertShapeSchema.strict().transform(
  data => {
    const isNoJmc = Boolean(data.isNoJmc);

    return {
      poId: data.poNumber,
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
  }
);

export const AddJmcResponseSchema = z.looseObject({
  message: z.string(),
});
