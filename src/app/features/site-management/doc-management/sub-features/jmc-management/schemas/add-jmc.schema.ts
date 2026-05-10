import { z } from 'zod';
import { JmcUpsertShapeSchema } from './base-jmc.schema';
import { transformDateFormat } from '@shared/utility/date-time.util';

export const AddJmcRequestSchema = JmcUpsertShapeSchema.strict().transform(
  data => {
    return {
      siteId: data.projectName,
      partyType: data.docType,
      contractorId: data.contractorName,
      vendorId: data.vendorName,
      jmcNumber: data.jmcNumber,
      jmcDate: transformDateFormat(data.jmcDate),
      taxableAmount: data.taxableAmount,
      gstAmount: data.gstAmount,
      totalAmount: data.totalAmount,
      fileKey: data.jmcFileKey,
      fileName: data.jmcFileName,
      remarks: data.remarks,
    };
  }
);

export const AddJmcResponseSchema = z.looseObject({
  message: z.string(),
});
