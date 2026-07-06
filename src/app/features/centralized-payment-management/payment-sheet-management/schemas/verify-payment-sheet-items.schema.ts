import { uuidField } from '@shared/schemas';
import z from 'zod';

export const VerifyPaymentSheetItemsRequestSchema = z
  .object({
    beneficiaryIds: z.array(uuidField).min(1),
  })
  .strict()
  .transform(data => ({
    itemIds: data.beneficiaryIds,
  }));

export const VerifyPaymentSheetItemsResponseSchema = z.looseObject({
  message: z.string(),
});
