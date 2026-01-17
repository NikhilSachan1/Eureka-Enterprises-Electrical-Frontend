import { z } from 'zod';

export const LoginRequestSchema = z
  .object({
    email: z.email().trim().min(1).toLowerCase(),
    password: z.string().min(1),
    rememberMe: z.boolean(),
  })
  .strict()
  .transform(data => ({
    email: data.email,
    password: data.password,
  }));

export const LoginResponseSchema = z
  .object({
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1),
    name: z.string().min(1),
    firstName: z.string().min(1),
    lastName: z.string().min(1).max(100),
    email: z.email().toLowerCase(),
    designation: z.string().min(1),
    profilePicture: z.string().min(1).nullable(),
    roles: z.array(z.string()).min(1),
    activeRole: z.string().min(1),
    expiresIn: z.string().min(1),
  })
  .strict();
