import { z } from 'zod';

// Schema for individual permission
export const UserPermissionBaseSchema = z
  .object({
    id: z.uuid(),
    name: z.string().trim().min(1),
    source: z.enum(['override', 'role']),
    isGranted: z.boolean(),
  })
  .strict();

// Schema for module permissions
export const ModulePermissionsBaseSchema = z
  .object({
    module: z.string().trim().min(1),
    permissions: z.array(UserPermissionBaseSchema),
  })
  .strict();
