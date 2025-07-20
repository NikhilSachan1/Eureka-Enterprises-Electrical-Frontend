import { z } from 'zod';

export const RoleDeleteRequestSchema = z
  .object({
    ids: z.array(z.string()).min(1),
  })
  .strict();

export const RoleDeleteResponseSchema = z
  .object({
    failed: z.array(z.string()),
    success: z.array(z.string()),
  })
  .strict();
