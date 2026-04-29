import { z } from 'zod';
import { dateField, fileField } from '@shared/schemas';

export const PaymentDocAddRequestSchema = z
  .object({
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
  .strict();

export const PaymentDocAddResponseSchema = z.looseObject({
  message: z.string(),
});
