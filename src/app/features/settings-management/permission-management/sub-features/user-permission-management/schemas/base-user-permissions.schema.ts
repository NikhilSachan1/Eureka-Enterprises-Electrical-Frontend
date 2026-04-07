import { z } from 'zod';

// Schema for individual permission
export const UserPermissionBaseSchema = z.looseObject({
  id: z.uuid(),
  name: z.string().trim().min(1),
  source: z.enum(['override', 'role']),
  isGranted: z.boolean(),
});

// Schema for module permissions
export const ModulePermissionsBaseSchema = z.looseObject({
  module: z.string().trim().min(1),
  permissions: z.array(UserPermissionBaseSchema),
});
