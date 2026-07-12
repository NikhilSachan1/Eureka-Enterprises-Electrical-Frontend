import { z } from 'zod';
import { InvoiceUpsertShapeSchema } from './base-invoice.schema';
import { roundCurrencyAmount } from '@shared/utility';
import { transformDateFormat } from '@shared/utility/date-time.util';

export const AddInvoiceRequestSchema =
  InvoiceUpsertShapeSchema.strict().transform(data => {
    const isNoInvoice = Boolean(data.isNoInvoice);

    return {
      jmcId: data.jmcNumber,
      invoiceNumber: isNoInvoice ? null : data.invoiceNumber,
      invoiceDate: transformDateFormat(data.invoiceDate),
      taxableAmount: roundCurrencyAmount(Number(data.taxableAmount ?? 0)),
      tdsPercentage: Number(data.tdsPercent ?? 0),
      tdsAmount: roundCurrencyAmount(Number(data.tdsAmount ?? 0)),
      gstAmount: roundCurrencyAmount(Number(data.gstAmount ?? 0)),
      gstPercentage: Number(data.gstPercent ?? 0),
      totalAmount: roundCurrencyAmount(Number(data.totalAmount ?? 0)),
      isGstHold: isNoInvoice ? false : Boolean(data.isGstHold),
      fileKey: isNoInvoice ? null : data.invoiceFileKey,
      fileName: isNoInvoice ? null : data.invoiceFileName,
      remarks: data.remarks,
    };
  });

export const AddInvoiceResponseSchema = z.looseObject({
  message: z.string(),
});
