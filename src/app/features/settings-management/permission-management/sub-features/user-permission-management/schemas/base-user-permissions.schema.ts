import { z } from 'zod';

// Schema for individual permission
export const UserPermissionBaseSchema = z
  .object({
    id: z.string().uuid({ message: 'Permission ID must be a valid UUID' }),
    name: z
      .string({ required_error: 'Permission name is required' })
      .trim()
      .min(1, 'Permission name cannot be empty'),
    source: z.enum(['override', 'role'], {
      required_error: 'Permission source is required',
      invalid_type_error:
        'Permission source must be either "override" or "role"',
    }),
    isGranted: z.boolean({
      required_error: 'Permission grant status is required',
    }),
  })
  .strict();

// Schema for module permissions
export const ModulePermissionsBaseSchema = z
  .object({
    module: z
      .string({ required_error: 'Module name is required' })
      .trim()
      .min(1, 'Module name cannot be empty'),
    permissions: z.array(UserPermissionBaseSchema),
  })
  .strict();
