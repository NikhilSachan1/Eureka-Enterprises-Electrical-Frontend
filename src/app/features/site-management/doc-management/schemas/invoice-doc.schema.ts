import { z } from 'zod';
import { dateField, fileField } from '@shared/schemas';
import { EDocType } from '../types/doc.enum';
import { transformDateFormat } from '@shared/utility';

export const InvoiceDocAddRequestSchema = z
  .object({
    jmcNumber: z.string(),
    invoiceNumber: z.string(),
    invoiceDate: dateField,
    invoiceTaxableAmount: z.number(),
    invoiceGstAmount: z.number(),
    invoiceTotalAmount: z.number(),
    invoiceAttachments: z.array(fileField),
    invoiceRemark: z.string(),
  })
  .strict()
  .transform(data => {
    return {
      documentNumber: data.invoiceNumber,
      docReferenceNumber: data.jmcNumber,
      documentDate: transformDateFormat(data.invoiceDate),
      taxableAmount: data.invoiceTaxableAmount,
      gstAmount: data.invoiceGstAmount,
      netAmount: data.invoiceTotalAmount,
      attachments: data.invoiceAttachments,
      note: data.invoiceRemark,
      documentType: EDocType.INVOICE,
    };
  });

export const InvoiceDocAddResponseSchema = z.looseObject({
  message: z.string(),
});
