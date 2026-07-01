import { z } from 'zod';
import { BookPaymentUpsertShapeSchema } from './base-book-payment.schema';

export const ApproveBookPaymentRequestSchema =
  BookPaymentUpsertShapeSchema.pick({
    remarks: true,
  })
    .strict()
    .transform(data => {
      return {
        reason: data.remarks,
      };
    });

export const ApproveBookPaymentResponseSchema = z.looseObject({
  message: z.string(),
});
