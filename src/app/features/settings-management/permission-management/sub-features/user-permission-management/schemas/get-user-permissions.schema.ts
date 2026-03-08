import { z } from 'zod';
import { ModulePermissionsBaseSchema } from './base-user-permissions.schema';

export const UserPermissionsGetRequestSchema = z
  .object({
    userId: z.uuid().optional(),
    roleId: z.uuid().optional(),
  })
  .strict();

export const UserPermissionsGetResponseSchema = z
  .object({
    userId: z.uuid(),
    role: z
      .object({
        id: z.uuid(),
        name: z.string(),
        label: z.string(),
      })
      .optional(),
    permissions: z.array(ModulePermissionsBaseSchema),
  })
  .strict();
