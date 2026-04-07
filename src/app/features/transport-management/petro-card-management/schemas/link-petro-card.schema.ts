import { z } from 'zod';
import { uuidField } from '@shared/schemas';

export const PetroCardLinkRequestSchema = z
  .object({
    cardNumber: uuidField,
    action: z.string().min(1),
    vehicleName: uuidField,
  })
  .strict()
  .transform(data => {
    return {
      cardId: data.cardNumber,
      action: data.action,
      vehicleMasterId: data.vehicleName,
    };
  });

export const PetroCardLinkResponseSchema = z.looseObject({
  message: z.string(),
});
