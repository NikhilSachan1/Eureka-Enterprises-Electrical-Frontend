import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const UserDelegationManagedUsersRequestSchema = z
  .object({
    module: z.string().trim().min(1),
  })
  .strict();

export const UserDelegationManagedUserSchema = z.looseObject({
  id: uuidField,
  employeeId: z.string(),
  name: z.string(),
  designation: z.string().nullable().optional(),
  isSelf: z.boolean(),
});

export const UserDelegationManagedUsersResponseSchema = z.looseObject({
  module: z.string(),
  scope: z.string(),
  users: z.array(UserDelegationManagedUserSchema),
});
