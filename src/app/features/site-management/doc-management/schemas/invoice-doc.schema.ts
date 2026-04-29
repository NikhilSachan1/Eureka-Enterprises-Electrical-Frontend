import { z } from 'zod';
import { dateField, fileField } from '@shared/schemas';

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
  .strict();

export const InvoiceDocAddResponseSchema = z.looseObject({
  message: z.string(),
});
