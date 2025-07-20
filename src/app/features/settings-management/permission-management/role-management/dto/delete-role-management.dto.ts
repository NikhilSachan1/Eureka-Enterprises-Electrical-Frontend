import { z } from 'zod';

export const DeleteRoleRequestSchema = z.object({
  ids: z.array(z.string()).min(1),
});

export const DeleteRoleResponseSchema = z
  .object({
    failed: z.array(z.string()),
    success: z.array(z.string()),
  })
  .strict();
