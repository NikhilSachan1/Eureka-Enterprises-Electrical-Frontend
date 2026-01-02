import { z } from 'zod';

export const LoginRequestSchema = z
  .object({
    email: z.email().trim().min(1).toLowerCase(),
    password: z.string().min(1),
  })
  .strict();

export const LoginResponseSchema = z
  .object({
    token: z.string().min(1),
    name: z.string().min(1),
    firstName: z.string().min(1),
    lastName: z.string().min(1).max(100),
    email: z.email().toLowerCase(),
    designation: z.string().min(1),
    profilePicture: z.string().min(1).nullable(),
    role: z.string().min(1),
  })
  .strict();
