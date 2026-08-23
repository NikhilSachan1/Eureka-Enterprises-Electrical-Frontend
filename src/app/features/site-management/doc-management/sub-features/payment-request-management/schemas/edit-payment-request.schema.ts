import { z } from 'zod';
import { PaymentRequestUpsertShapeSchema } from './base-payment-request.schema';
import { roundCurrencyAmount } from '@shared/utility';

export const EditPaymentRequestRequestSchema =
  PaymentRequestUpsertShapeSchema.pick({
    requestedAmount: true,
    reason: true,
  })
    .strict()
    .transform(data => ({
      requestedAmount: roundCurrencyAmount(Number(data.requestedAmount)),
      reason: data.reason.trim(),
    }));

export const EditPaymentRequestResponseSchema = z.looseObject({
  message: z.string(),
});
