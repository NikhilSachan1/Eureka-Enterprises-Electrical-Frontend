import { uuidField } from '@shared/schemas';
import z from 'zod';

export const PetroCardBaseSchema = z
  .object({
    id: uuidField,
    cardNumber: z.string().min(1),
    cardType: z.string().min(1),
    holderName: z.string().min(1),
    expiryDate: z.string().min(1),
    expiryStatus: z.string().min(1),
  })
  .strict();
