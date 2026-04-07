import { z } from 'zod';

export const ResetPasswordRequestSchema = z
  .object({
    newPassword: z.string().min(1),
    confirmPassword: z.string().min(1),
  })
  .strict();

export const ResetPasswordResponseSchema = z.looseObject({
  message: z.string().min(1),
});
