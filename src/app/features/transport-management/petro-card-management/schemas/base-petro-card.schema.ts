import { uuidField } from '@shared/schemas';
import z from 'zod';

export const PetroCardBaseSchema = z.looseObject({
  id: uuidField,
  cardNumber: z.string().min(1),
  cardType: z.string().min(1),
  cardName: z.string().min(1),
  holderName: z.string().min(1).nullable(),
  expiryDate: z.string().min(1).nullable(),
  expiryStatus: z.string().min(1).nullable(),
});

const { cardNumber, cardName } = PetroCardBaseSchema.shape;

export const PetroCardUpsertShapeSchema = z.object({
  petroCardNumber: cardNumber,
  petroCardName: cardName,
});
