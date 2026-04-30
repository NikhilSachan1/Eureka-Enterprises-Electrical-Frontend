import { z } from 'zod';
import { dateField, fileField } from '@shared/schemas';
import { EDocType } from '../types/doc.enum';
import { transformDateFormat } from '@shared/utility';

export const PaymentDocAddRequestSchema = z
  .object({
    docContext: z.enum(['sales', 'purchase']),
    invoiceNumber: z.string(),
    transactionNumber: z.string(),
    paymentDate: dateField,
    paymentTaxableAmount: z.number(),
    paymentGstAmount: z.number(),
    paymentTdsDeductionAmount: z.number(),
    paymentTotalAmount: z.number(),
    paymentAttachments: z.array(fileField),
    paymentRemark: z.string(),
  })
  .strict()
  .transform(data => {
    return {
      documentNumber: data.transactionNumber,
      docReferenceNumber: data.invoiceNumber,
      documentDate: transformDateFormat(data.paymentDate),
      taxableAmount: data.paymentTaxableAmount,
      gstAmount: data.paymentGstAmount,
      tdsDeductionAmount: data.paymentTdsDeductionAmount,
      netAmount: data.paymentTotalAmount,
      attachments: data.paymentAttachments,
      note: data.paymentRemark,
      documentType: EDocType.PAYMENT,
      docContext: data.docContext,
    };
  });

export const PaymentDocAddResponseSchema = z.looseObject({
  message: z.string(),
});
