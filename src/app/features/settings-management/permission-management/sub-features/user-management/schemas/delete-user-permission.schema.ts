import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const UserPermissionDeleteRequestSchema = z
  .object({
    userId: z.array(uuidField).min(1),
  })
  .strict();

export const UserPermissionDeleteResponseSchema = z
  .object({
    failed: z.array(
      z.object({
        error: z.string(),
        userId: uuidField,
      })
    ),
    success: z.array(z.string()),
  })
  .strict();
