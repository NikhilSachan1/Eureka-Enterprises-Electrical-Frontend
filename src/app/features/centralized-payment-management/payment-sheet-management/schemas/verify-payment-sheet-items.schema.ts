import { uuidField } from '@shared/schemas';
import z from 'zod';

export const VerifyPaymentSheetItemsRequestSchema = z
  .object({
    itemIds: z.array(uuidField).min(1),
  })
  .strict();

export const VerifyPaymentSheetItemsResponseSchema = z.looseObject({
  message: z.string(),
});
