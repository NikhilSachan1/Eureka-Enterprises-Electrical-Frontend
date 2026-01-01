import { z } from 'zod';
import { PetroCardAddRequestSchema } from './add-petro-card.schema';

export const PetroCardEditRequestSchema = PetroCardAddRequestSchema.strict();
export const PetroCardEditResponseSchema = z.object({
  message: z.string(),
});
