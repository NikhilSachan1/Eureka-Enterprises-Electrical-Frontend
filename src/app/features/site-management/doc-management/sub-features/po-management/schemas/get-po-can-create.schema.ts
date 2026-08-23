import { uuidField } from '@shared/schemas';
import z from 'zod';

export const PoCanCreateGetRequestSchema = z
  .object({
    siteId: uuidField,
  })
  .strict();

export const PoCanCreateGetResponseSchema = z.looseObject({
  allowed: z.boolean(),
  reason: z.string().nullable(),
});
