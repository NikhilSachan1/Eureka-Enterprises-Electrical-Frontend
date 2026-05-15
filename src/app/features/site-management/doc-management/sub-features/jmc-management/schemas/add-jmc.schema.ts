import { z } from 'zod';
import { JmcUpsertShapeSchema } from './base-jmc.schema';
import { transformDateFormat } from '@shared/utility/date-time.util';

export const AddJmcRequestSchema = JmcUpsertShapeSchema.strict().transform(
  data => {
    return {
      poId: data.poNumber,
      jmcNumber: data.jmcNumber,
      jmcDate: transformDateFormat(data.jmcDate),
      fileKey: data.jmcFileKey,
      fileName: data.jmcFileName,
      remarks: data.remarks,
    };
  }
);

export const AddJmcResponseSchema = z.looseObject({
  message: z.string(),
});
