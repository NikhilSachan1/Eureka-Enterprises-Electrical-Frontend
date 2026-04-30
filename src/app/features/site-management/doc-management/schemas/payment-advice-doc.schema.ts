import { z } from 'zod';
import { dateField, fileField } from '@shared/schemas';
import { EDocType } from '../types/doc.enum';
import { transformDateFormat } from '@shared/utility';

export const PaymentAdviceDocAddRequestSchema = z
  .object({
    docContext: z.enum(['sales', 'purchase']),
    transactionNumber: z.string(),
    paymentAdviceNumber: z.string(),
    paymentAdviceDate: dateField,
    paymentAdviceAttachments: z.array(fileField),
    paymentAdviceRemark: z.string(),
  })
  .strict()
  .transform(data => {
    return {
      documentNumber: data.paymentAdviceNumber,
      docReferenceNumber: data.transactionNumber,
      documentDate: transformDateFormat(data.paymentAdviceDate),
      attachments: data.paymentAdviceAttachments,
      note: data.paymentAdviceRemark,
      documentType: EDocType.PAYMENT_ADVICE,
      docContext: data.docContext,
    };
  });

export const PaymentAdviceDocAddResponseSchema = z.looseObject({
  message: z.string(),
});
