import { z } from 'zod';
import { PoUpsertShapeSchema } from './base-po.schema';
import { transformDateFormat } from '@shared/utility/date-time.util';

export const AddPoRequestSchema = PoUpsertShapeSchema.strict().transform(
  data => {
    return {
      siteId: data.projectName,
      partyType: data.docType,
      contractorId: data.contractorName,
      vendorId: data.vendorName,
      poNumber: data.poNumber,
      poDate: transformDateFormat(data.poDate),
      gstPercentage: data.gstPercent,
      taxableAmount: data.taxableAmount,
      gstAmount: data.gstAmount,
      totalAmount: data.totalAmount,
      fileKey: data.poFileKey,
      fileName: data.poFileName,
      remarks: data.remarks,
    };
  }
);

export const AddPoResponseSchema = z.looseObject({
  message: z.string(),
});
