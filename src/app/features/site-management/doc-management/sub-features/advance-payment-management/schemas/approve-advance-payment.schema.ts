import { z } from 'zod';

export const ApproveAdvancePaymentRequestSchema = z.object({}).strict();

export const ApproveAdvancePaymentResponseSchema = z.looseObject({
  message: z.string(),
});
