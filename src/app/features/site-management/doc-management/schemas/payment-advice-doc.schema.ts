import { z } from 'zod';
import { dateField, fileField } from '@shared/schemas';

export const PaymentAdviceDocAddRequestSchema = z
  .object({
    transactionNumber: z.string(),
    paymentAdviceNumber: z.string(),
    paymentAdviceDate: dateField,
    paymentAdviceAttachments: z.array(fileField),
    paymentAdviceRemark: z.string(),
  })
  .strict();

export const PaymentAdviceDocAddResponseSchema = z.looseObject({
  message: z.string(),
});
