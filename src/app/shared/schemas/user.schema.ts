import { z } from 'zod';
import { uuidField } from './common.schema';

export const UserSchema = z
  .object({
    id: uuidField,
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.email(),
    employeeId: z.string().min(1),
    profilePicture: z.string().min(1).optional().nullable(),
  })
  .strict();
