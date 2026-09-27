import { z } from 'zod';
import { uuidField } from '@shared/schemas';
import { roundCurrencyAmount } from '@shared/utility';

export const SettleAdvanceInvoiceRequestSchema = z
  .object({
    advanceNumber: uuidField,
    amount: z.number().min(0.01),
  })
  .strict()
  .transform(data => ({
    advancePaymentId: data.advanceNumber,
    amount: roundCurrencyAmount(Number(data.amount)),
  }));

export const SettleAdvanceInvoiceResponseSchema = z.looseObject({
  message: z.string(),
  settledAmount: z.union([z.string(), z.number()]).optional(),
  advanceBalanceAfter: z.union([z.string(), z.number()]).optional(),
  invoiceDueAfter: z.union([z.string(), z.number()]).optional(),
});
