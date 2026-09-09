import { z } from 'zod';
import { PoUpsertShapeSchema } from './base-po.schema';
import { transformDateFormat } from '@shared/utility/date-time.util';

export const AddPoRequestSchema = PoUpsertShapeSchema.strict().transform(
  data => {
    const isSystemGenerated = Array.isArray(data.items) && data.items.length > 0;

    if (isSystemGenerated) {
      return {
        siteId: data.projectName,
        partyType: data.docType,
        contractorId: data.contractorName,
        vendorId: data.vendorName,
        poDate: transformDateFormat(data.poDate),
        gstPercentage: data.gstPercent,
        gstType: data.gstType,
        remarks: data.remarks,
        items: data.items,
        termsAndConditions: data.termsAndConditions,
      };
    }

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
