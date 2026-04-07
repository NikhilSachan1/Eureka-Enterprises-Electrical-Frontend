import { z } from 'zod';

export const LogoutRequestSchema = z
  .object({
    refreshToken: z.string().min(1),
  })
  .strict();

export const LogoutResponseSchema = z.looseObject({
  message: z.string().min(1),
});
