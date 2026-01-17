import { z } from 'zod';

export const ForgetPasswordRequestSchema = z
  .object({
    email: z.string(),
  })
  .strict()
  .transform(data => ({
    email: data.email.toLowerCase().trim(),
  }));

export const ForgetPasswordResponseSchema = z
  .object({
    message: z.string().min(1),
  })
  .strict();
