import { z } from 'zod';
import { PetroCardBaseSchema } from './base-petro-card.schema';
import { EPetroCardType } from '../types/petro-card.enum';

const { cardType } = PetroCardBaseSchema.shape;

export const PetroCardAddRequestSchema = PetroCardBaseSchema.pick({
  cardNumber: true,
  cardName: true,
})
  .extend({
    cardType: cardType.default(EPetroCardType.PETRO_CARD).optional(),
  })
  .strict();

export const PetroCardAddResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
