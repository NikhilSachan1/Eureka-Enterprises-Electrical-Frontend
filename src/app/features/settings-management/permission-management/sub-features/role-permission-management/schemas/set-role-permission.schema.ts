import { z } from 'zod';
import { uuidField } from '@shared/schemas';

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

export const RolePermissionSetResultSchema = z
  .object({
    id: uuidField,
    message: z.string(),
    success: z.boolean(),
  })
  .strict();

export const RolePermissionsSetResponseSchema = z
  .object({
    message: z.string(),
    failureCount: z.number().int().nonnegative(),
    successCount: z.number().int().nonnegative(),
    totalRequested: z.number().int().nonnegative(),
    results: z.array(RolePermissionSetResultSchema),
  })
  .strict();
