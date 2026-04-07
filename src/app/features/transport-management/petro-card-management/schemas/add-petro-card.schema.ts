import { z } from 'zod';
import { PetroCardUpsertShapeSchema } from './base-petro-card.schema';
import { EPetroCardType } from '../types/petro-card.enum';

export const PetroCardAddRequestSchema =
  PetroCardUpsertShapeSchema.strict().transform(data => {
    return {
      cardNumber: data.petroCardNumber,
      cardName: data.petroCardName,
      cardType: EPetroCardType.PETRO_CARD,
    };
  });

export const PetroCardAddResponseSchema = z.looseObject({
  message: z.string(),
});
