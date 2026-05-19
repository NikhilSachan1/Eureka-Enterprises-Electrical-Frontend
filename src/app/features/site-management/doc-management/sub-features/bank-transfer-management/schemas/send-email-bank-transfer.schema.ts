import { z } from 'zod';

export const SendEmailBankTransferRequestSchema = z.object({
  to: z.array(z.string()).min(1),
  cc: z.array(z.string()),
  subject: z.string().min(1),
  body: z.string().min(1),
  attachmentKeys: z.array(z.string()),
});

export const SendEmailBankTransferResponseSchema = z.looseObject({
  message: z.string(),
});
