import { z } from 'zod';

export const RefreshTokenRequestSchema = z
  .object({
    refreshToken: z.string().min(1),
  })
  .strict();

export const RefreshTokenResponseSchema = z.looseObject({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresIn: z.string().min(1),
  roles: z.array(z.string()).min(1),
  activeRole: z.string().min(1),
  message: z.string().min(1),
});
