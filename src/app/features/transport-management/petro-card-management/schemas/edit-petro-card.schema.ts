import { z } from 'zod';
import { PetroCardUpsertShapeSchema } from './base-petro-card.schema';

export const PetroCardEditRequestSchema =
  PetroCardUpsertShapeSchema.strict().transform(data => {
    return {
      cardNumber: data.petroCardNumber,
      cardName: data.petroCardName,
    };
  });

export const PetroCardEditResponseSchema = z.object({
  message: z.string(),
});
