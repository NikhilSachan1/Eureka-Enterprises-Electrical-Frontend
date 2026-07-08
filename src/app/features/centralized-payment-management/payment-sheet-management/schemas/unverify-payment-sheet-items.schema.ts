import { uuidField } from '@shared/schemas';
import z from 'zod';

export const UnverifyPaymentSheetItemsRequestSchema = z
  .object({
    itemIds: z.array(uuidField).min(1),
  })
  .strict();

export const UnverifyPaymentSheetItemsResponseSchema = z.looseObject({
  message: z.string(),
});
