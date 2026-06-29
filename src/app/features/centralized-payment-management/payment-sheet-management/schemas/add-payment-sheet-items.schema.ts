import z from 'zod';
import { PaymentSheetItemInputSchema } from './payment-sheet-item.schema';

export const AddPaymentSheetItemsRequestSchema = z
  .object({
    items: z.array(PaymentSheetItemInputSchema),
  })
  .strict();

export const AddPaymentSheetItemsResponseSchema = z.looseObject({
  message: z.string(),
});
