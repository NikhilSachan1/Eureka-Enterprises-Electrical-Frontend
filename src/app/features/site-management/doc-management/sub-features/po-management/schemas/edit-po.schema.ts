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
    const isSystemGenerated = Array.isArray(data.items) && data.items.length > 0;

    if (isSystemGenerated) {
      return {
        poDate: transformDateFormat(data.poDate),
        gstPercentage: data.gstPercent,
        gstType: data.gstType,
        remarks: data.remarks,
        items: data.items,
        termsAndConditions: data.termsAndConditions,
      };
    }

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
