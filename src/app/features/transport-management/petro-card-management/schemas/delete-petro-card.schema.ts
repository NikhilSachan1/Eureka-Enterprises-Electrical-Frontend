import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const PetroCardDeleteRequestSchema = z
  .object({
    petroCardIds: z.array(uuidField).min(1),
  })
  .strict()
  .transform(data => {
    return {
      cardIds: data.petroCardIds,
    };
  });

export const PetroCardDeleteResultSchema = z.looseObject({
  id: uuidField,
});

export const PetroCardDeleteErrorSchema = z.looseObject({
  cardId: uuidField,
  error: z.string().min(1),
});

export const PetroCardDeleteResponseSchema = z.looseObject({
  message: z.string(),
  result: z.array(PetroCardDeleteResultSchema),
  errors: z.array(PetroCardDeleteErrorSchema),
});
