import { z } from 'zod';
import { AdvancePaymentUpsertShapeSchema } from './base-advance-payment.schema';
import { roundCurrencyAmount } from '@shared/utility';
import { transformDateFormat } from '@shared/utility/date-time.util';

export const EditAdvancePaymentRequestSchema =
  AdvancePaymentUpsertShapeSchema.pick({
    amount: true,
    advanceDate: true,
  })
    .strict()
    .transform(data => ({
      amount: roundCurrencyAmount(Number(data.amount)),
      advanceDate: transformDateFormat(data.advanceDate),
    }));

export const EditAdvancePaymentResponseSchema = z.looseObject({
  message: z.string(),
});
