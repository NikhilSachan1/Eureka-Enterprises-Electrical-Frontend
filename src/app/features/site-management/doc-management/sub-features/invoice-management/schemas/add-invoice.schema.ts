import { z } from 'zod';
import { InvoiceUpsertShapeSchema } from './base-invoice.schema';
import { transformDateFormat } from '@shared/utility/date-time.util';

export const AddInvoiceRequestSchema =
  InvoiceUpsertShapeSchema.strict().transform(data => {
    return {
      jmcId: data.jmcNumber,
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

export const AddInvoiceResponseSchema = z.looseObject({
  message: z.string(),
});
