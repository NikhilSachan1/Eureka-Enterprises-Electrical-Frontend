import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  employeeId: z.string().min(1).optional(),
});
