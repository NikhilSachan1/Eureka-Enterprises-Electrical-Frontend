import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const AssetDeleteRequestSchema = z
  .object({
    id: uuidField,
  })
  .strict();

export const AssetDeleteResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
