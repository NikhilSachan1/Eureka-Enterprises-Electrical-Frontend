import { z } from 'zod';
import { PaymentRequestUpsertShapeSchema } from './base-payment-request.schema';
import { roundCurrencyAmount } from '@shared/utility';

export const AddPaymentRequestRequestSchema =
  PaymentRequestUpsertShapeSchema.pick({
    invoiceNumber: true,
    requestedAmount: true,
    reason: true,
  })
    .strict()
    .transform(data => ({
      invoiceId: data.invoiceNumber,
      requestedAmount: roundCurrencyAmount(Number(data.requestedAmount)),
      reason: data.reason?.trim() ? data.reason.trim() : undefined,
    }));

export const AddPaymentRequestResponseSchema = z.looseObject({
  message: z.string(),
  id: z.string().optional(),
});
