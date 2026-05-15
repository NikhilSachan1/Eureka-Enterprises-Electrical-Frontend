import { z } from 'zod';
import { InvoiceUpsertShapeSchema } from './base-invoice.schema';
import { transformDateFormat } from '@shared/utility/date-time.util';

export const EditInvoiceRequestSchema = InvoiceUpsertShapeSchema.omit({
  jmcNumber: true,
})
  .strict()
  .transform(data => {
    return {
      invoiceNumber: data.invoiceNumber,
      invoiceDate: transformDateFormat(data.invoiceDate),
      taxableAmount: data.taxableAmount,
      gstAmount: data.gstAmount,
      gstPercentage: data.gstPercent,
      totalAmount: data.totalAmount,
      fileKey: data.invoiceFileKey,
      fileName: data.invoiceFileName,
      remarks: data.remarks,
    };
  });

export const EditInvoiceResponseSchema = z.looseObject({
  message: z.string(),
});
