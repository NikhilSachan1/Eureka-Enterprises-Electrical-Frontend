import { z } from 'zod';
import { dateField } from '@shared/schemas';
import { EDocType } from '../types/doc.enum';
import { transformDateFormat } from '@shared/utility';

export const PaymentDocAddRequestSchema = z
  .object({
    docContext: z.enum(['sales', 'purchase']),
    invoiceNumber: z.string(),
    paymentDate: dateField,
    paymentTaxableAmount: z.number(),
    paymentGstAmount: z.number(),
    paymentTdsDeductionAmount: z.number(),
    paymentTotalAmount: z.number(),
    paymentRemark: z.string().optional(),
  })
  .strict()
  .transform(data => {
    const draftRef = `PMT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    return {
      documentNumber: draftRef,
      docReferenceNumber: data.invoiceNumber,
      documentDate: transformDateFormat(data.paymentDate),
      taxableAmount: data.paymentTaxableAmount,
      gstAmount: data.paymentGstAmount,
      tdsDeductionAmount: data.paymentTdsDeductionAmount,
      netAmount: data.paymentTotalAmount,
      attachments: null,
      note: data.paymentRemark ?? null,
      documentType: EDocType.PAYMENT,
      docContext: data.docContext,
    };
  });

export const PaymentDocAddResponseSchema = z.looseObject({
  message: z.string(),
});
