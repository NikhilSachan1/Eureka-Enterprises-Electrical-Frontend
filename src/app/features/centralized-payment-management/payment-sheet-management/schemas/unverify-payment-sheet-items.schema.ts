import { uuidField } from '@shared/schemas';
import z from 'zod';

export const UnverifyPaymentSheetItemsRequestSchema = z
  .object({
    beneficiaryIds: z.array(uuidField).min(1),
  })
  .strict()
  .transform(data => ({
    itemIds: data.beneficiaryIds,
  }));

export const UnverifyPaymentSheetItemsResponseSchema = z.looseObject({
  message: z.string(),
});
