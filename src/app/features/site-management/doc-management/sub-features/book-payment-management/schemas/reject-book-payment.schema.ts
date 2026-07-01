import { z } from 'zod';
import { BookPaymentUpsertShapeSchema } from './base-book-payment.schema';

export const RejectBookPaymentRequestSchema = BookPaymentUpsertShapeSchema.pick(
  {
    remarks: true,
  }
)
  .strict()
  .transform(data => {
    return {
      reason: data.remarks,
    };
  });

export const RejectBookPaymentResponseSchema = z.looseObject({
  message: z.string(),
});
