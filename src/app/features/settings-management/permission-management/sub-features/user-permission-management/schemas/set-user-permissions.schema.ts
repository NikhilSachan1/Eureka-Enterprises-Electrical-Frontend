import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const UserPermissionsSetRequestSchema = z
  .object({
    userId: z.uuid(),
    newPermissions: z.array(z.uuid()),
    revokedPermissions: z.array(z.uuid()),
    defaultPermissions: z.array(z.uuid()),
  })
  .strict()
  .transform(data => {
    return {
      userId: data.userId,
      userPermissions: [
        ...data.newPermissions.map(permissionId => ({
          permissionId,
          isGranted: true,
        })),
        ...data.revokedPermissions.map(permissionId => ({
          permissionId,
          isGranted: false,
        })),
      ],
    };
  });

export const UserPermissionsSetResultSchema = z
  .object({
    id: uuidField,
    message: z.string(),
    success: z.boolean(),
  })
  .strict();

export const UserPermissionsSetResponseSchema = z
  .object({
    message: z.string(),
    failureCount: z.number().int().nonnegative(),
    successCount: z.number().int().nonnegative(),
    totalRequested: z.number().int().nonnegative(),
    results: z.array(UserPermissionsSetResultSchema),
  })
  .strict();
