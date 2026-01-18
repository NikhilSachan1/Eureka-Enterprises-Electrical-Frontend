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

export const PetroCardDeleteResultSchema = z
  .object({
    id: uuidField,
  })
  .strict();

export const PetroCardDeleteErrorSchema = z
  .object({
    cardId: uuidField,
    error: z.string().min(1),
  })
  .strict();

export const PetroCardDeleteResponseSchema = z
  .object({
    message: z.string(),
    result: z.array(PetroCardDeleteResultSchema),
    errors: z.array(PetroCardDeleteErrorSchema),
  })
  .strict();
