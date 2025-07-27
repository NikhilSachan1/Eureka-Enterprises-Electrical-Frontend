import { z } from 'zod';
import { ModulePermissionsBaseSchema } from './base-user-permissions.schema';

export const UserPermissionsGetRequestSchema = z
  .object({
    userId: z.uuid(),
  })
  .strict();

export const UserPermissionsGetResponseSchema = z
  .object({
    userId: z.uuid(),
    permissions: z.array(ModulePermissionsBaseSchema),
  })
  .strict();
