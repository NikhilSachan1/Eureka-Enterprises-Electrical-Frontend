import { uuidField } from '@shared/schemas';
import z from 'zod';
import { PaymentSheetItemInputSchema } from './payment-sheet-item.schema';

export const CreatePaymentSheetRequestSchema = z
  .object({
    title: z.string().trim().max(255).nullable(),
    items: z.array(PaymentSheetItemInputSchema),
  })
  .strict();

export const CreatePaymentSheetResponseSchema = z.looseObject({
  message: z.string(),
  id: uuidField,
});
