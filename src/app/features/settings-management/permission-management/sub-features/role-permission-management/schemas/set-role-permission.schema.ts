import { z } from 'zod';
import { RolePermissionsBaseSchema } from './base-role-permission.schema';

export const RolePermissionsSetRequestSchema = z
  .object({
    roleId: z.uuid(),
    newPermissions: z.array(z.uuid()),
    revokedPermissions: z.array(z.uuid()),
    defaultPermissions: z.array(z.uuid()),
  })
  .strict()
  .transform(data => {
    return {
      roleId: data.roleId,
      rolePermissions: [
        ...data.newPermissions.map(permissionId => ({
          permissionId,
          isActive: true,
        })),
        ...data.revokedPermissions.map(permissionId => ({
          permissionId,
          isActive: false,
        })),
      ],
    };
  });

export const RolePermissionsSetResponseSchema = z.array(
  z.object(RolePermissionsBaseSchema.shape)
);
