import { z } from 'zod';
import { roundCurrencyAmount } from '@shared/utility';

export const ApprovePaymentRequestRequestSchema = z
  .object({
    approvedAmount: z.number().min(0.01),
    remarks: z.string().nullable().optional(),
  })
  .strict()
  .transform(data => ({
    approvedAmount: roundCurrencyAmount(Number(data.approvedAmount)),
    remarks: data.remarks?.trim() ? data.remarks.trim() : undefined,
  }));

export const ApprovePaymentRequestResponseSchema = z.looseObject({
  message: z.string(),
  bookPaymentId: z.string().optional(),
});
