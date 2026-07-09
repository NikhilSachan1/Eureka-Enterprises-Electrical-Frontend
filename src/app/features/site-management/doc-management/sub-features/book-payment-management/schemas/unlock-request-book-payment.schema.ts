import { z } from 'zod';
import { BookPaymentUpsertShapeSchema } from './base-book-payment.schema';

export const UnlockRequestBookPaymentRequestSchema =
  BookPaymentUpsertShapeSchema.pick({
    remarks: true,
  })
    .strict()
    .transform(data => {
      return {
        reason: data.remarks,
      };
    });

export const UnlockRequestBookPaymentResponseSchema = z.looseObject({
  message: z.string(),
});
