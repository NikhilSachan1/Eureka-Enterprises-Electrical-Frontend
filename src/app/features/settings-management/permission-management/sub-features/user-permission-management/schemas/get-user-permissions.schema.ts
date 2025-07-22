import { z } from 'zod';
import { ModulePermissionsBaseSchema } from './base-user-permissions.schema';

export const UserPermissionsGetRequestSchema = z
  .object({
    userId: z.string().uuid({ message: 'User ID must be a valid UUID' }),
  })
  .strict();

export const UserPermissionsGetResponseSchema = z
  .object({
    userId: z.string().uuid({ message: 'User ID must be a valid UUID' }),
    permissions: z.array(ModulePermissionsBaseSchema),
  })
  .strict();
