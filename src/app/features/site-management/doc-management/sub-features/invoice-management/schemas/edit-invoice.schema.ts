import { z } from 'zod';
import { InvoiceUpsertShapeSchema } from './base-invoice.schema';
import { roundCurrencyAmount } from '@shared/utility';
import { transformDateFormat } from '@shared/utility/date-time.util';

export const EditInvoiceRequestSchema = InvoiceUpsertShapeSchema.omit({
  jmcNumber: true,
})
  .strict()
  .transform(data => {
    const isNoInvoice = Boolean(data.isNoInvoice);

    return {
      invoiceNumber: isNoInvoice ? 'NA' : data.invoiceNumber,
      invoiceDate: transformDateFormat(data.invoiceDate),
      taxableAmount: isNoInvoice
        ? 0
        : roundCurrencyAmount(Number(data.taxableAmount ?? 0)),
      tdsPercentage: isNoInvoice ? 0 : Number(data.tdsPercent ?? 0),
      tdsAmount: isNoInvoice
        ? 0
        : roundCurrencyAmount(Number(data.tdsAmount ?? 0)),
      gstAmount: isNoInvoice
        ? 0
        : roundCurrencyAmount(Number(data.gstAmount ?? 0)),
      gstPercentage: isNoInvoice ? 0 : Number(data.gstPercent ?? 0),
      totalAmount: isNoInvoice
        ? 0
        : roundCurrencyAmount(Number(data.totalAmount ?? 0)),
      isGstHold: isNoInvoice ? false : data.isGstHold,
      fileKey: isNoInvoice ? 'NA' : data.invoiceFileKey,
      fileName: isNoInvoice ? 'NA' : data.invoiceFileName,
      remarks: data.remarks,
    };
  });

export const EditInvoiceResponseSchema = z.looseObject({
  message: z.string(),
});
