import { z } from 'zod';

export const EmployeeResetPasswordRequestSchema = z
  .object({
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .strict();

export const EmployeeResetPasswordResponseSchema = z.looseObject({
  message: z.string().min(1),
});
