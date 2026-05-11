import { z } from 'zod';
import { PoUpsertShapeSchema } from './base-po.schema';
import { transformDateFormat } from '@shared/utility/date-time.util';

export const EditPoRequestSchema = PoUpsertShapeSchema.omit({
  projectName: true,
  contractorName: true,
  vendorName: true,
  docType: true,
})
  .strict()
  .transform(data => {
    return {
      poNumber: data.poNumber,
      poDate: transformDateFormat(data.poDate),
      taxableAmount: data.taxableAmount,
      gstPercentage: data.gstPercent,
      gstAmount: data.gstAmount,
      totalAmount: data.totalAmount,
      fileKey: data.poFileKey,
      fileName: data.poFileName,
      remarks: data.remarks,
    };
  });

export const EditPoResponseSchema = z.looseObject({
  message: z.string(),
});
