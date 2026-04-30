import { z } from 'zod';
import { dateField, fileField } from '@shared/schemas';
import { EDocType } from '../types/doc.enum';
import { transformDateFormat } from '@shared/utility';

export const PoDocAddRequestSchema = z
  .object({
    docContext: z.enum(['sales', 'purchase']),
    contractorName: z.string(),
    poNumber: z.string(),
    poDate: dateField,
    poTaxableAmount: z.number(),
    poGstAmount: z.number(),
    poTotalAmount: z.number(),
    poAttachments: z.array(fileField),
    poRemark: z.string(),
  })
  .strict()
  .transform(data => {
    return {
      contractorName: data.contractorName,
      documentNumber: data.poNumber,
      documentDate: transformDateFormat(data.poDate),
      taxableAmount: data.poTaxableAmount,
      gstAmount: data.poGstAmount,
      netAmount: data.poTotalAmount,
      attachments: data.poAttachments,
      note: data.poRemark,
      documentType: EDocType.PO,
      docContext: data.docContext,
    };
  });

export const PoDocAddResponseSchema = z.looseObject({
  message: z.string(),
});
