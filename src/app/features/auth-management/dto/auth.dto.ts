import { z } from 'zod';

export const LoginRequestSchema = z
  .object({
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .min(1, 'Email cannot be empty')
      .email('Must be a valid email address')
      .toLowerCase(),

    password: z
      .string({ required_error: 'Password is required' })
      .min(1, 'Password cannot be empty'),
  })
  .strict();

export const LoginResponseSchema = z
  .object({
    token: z
      .string({ required_error: 'Authentication token is REQUIRED from API' })
      .min(1, 'Token cannot be empty'),

    name: z
      .string({ required_error: 'Full name is REQUIRED from API' })
      .min(1, 'Full name cannot be empty'),

    firstName: z
      .string({ required_error: 'First name is REQUIRED from API' })
      .min(1, 'First name cannot be empty'),

    lastName: z
      .string({ required_error: 'Last name is REQUIRED from API' })
      .min(1, 'Last name cannot be empty')
      .max(100, 'Last name too long'),

    email: z
      .string({ required_error: 'Email is REQUIRED from API' })
      .email('API must return valid email format')
      .toLowerCase(),

    designation: z
      .string({ required_error: 'Designation is REQUIRED from API' })
      .min(1, 'Designation cannot be empty'),

    profilePicture: z
      .string({ required_error: 'Profile picture is REQUIRED from API' })
      .min(1, 'Profile picture cannot be empty')
      .nullable(),

    role: z
      .string({ required_error: 'Role is REQUIRED from API' })
      .min(1, 'Role cannot be empty'),
  })
  .strict();
