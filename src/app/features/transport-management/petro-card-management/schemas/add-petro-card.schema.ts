import { z } from 'zod';
import { PetroCardBaseSchema } from './base-petro-card.schema';
import { EPetroCardType } from '../types/petro-card.enum';

const { cardType } = PetroCardBaseSchema.shape;

export const PetroCardAddRequestSchema = PetroCardBaseSchema.omit({
  id: true,
  expiryStatus: true,
})
  .extend({
    cardType: cardType.default(EPetroCardType.PETRO_CARD),
  })
  .strict();

export const PetroCardAddResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
