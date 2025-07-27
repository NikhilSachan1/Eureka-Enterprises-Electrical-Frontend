import { z } from 'zod';
import { RolePermissionsBaseSchema } from './base-role-permission.schema';

export const RolePermissionsSetRequestSchema = z
  .object({
    roleId: z.uuid(),
    rolePermissions: z.array(
      z.object({
        permissionId: z.uuid(),
        isActive: z.boolean(),
      })
    ),
  })
  .strict();

export const RolePermissionsSetResponseSchema = z.array(
  z.object(RolePermissionsBaseSchema.shape)
);
