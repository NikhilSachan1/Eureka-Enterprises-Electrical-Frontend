import { z } from 'zod';

export const SwitchActiveRoleRequestSchema = z
  .object({
    targetRole: z.string().min(1),
  })
  .strict();

export const SwitchActiveRoleResponseSchema = z
  .object({
    accessToken: z.string().min(1),
    expiresIn: z.string().min(1),
    roles: z.array(z.string()).min(1),
    activeRole: z.string().min(1),
    message: z.string().min(1),
  })
  .strict();
