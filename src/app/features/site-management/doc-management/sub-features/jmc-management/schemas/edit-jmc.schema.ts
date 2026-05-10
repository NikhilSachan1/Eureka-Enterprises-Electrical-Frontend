import { z } from 'zod';
import { JmcUpsertShapeSchema } from './base-jmc.schema';
import { transformDateFormat } from '@shared/utility/date-time.util';

export const EditJmcRequestSchema = JmcUpsertShapeSchema.omit({
  projectName: true,
  contractorName: true,
  vendorName: true,
  docType: true,
})
  .strict()
  .transform(data => {
    return {
      jmcNumber: data.jmcNumber,
      jmcDate: transformDateFormat(data.jmcDate),
      taxableAmount: data.taxableAmount,
      gstAmount: data.gstAmount,
      totalAmount: data.totalAmount,
      fileKey: data.jmcFileKey,
      fileName: data.jmcFileName,
      remarks: data.remarks,
    };
  });

export const EditJmcResponseSchema = z.looseObject({
  message: z.string(),
});
