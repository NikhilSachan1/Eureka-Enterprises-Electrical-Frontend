import { AuditSchema } from '@shared/schemas';
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

export const UserPermissionsSetResponseSchema = z.array(
  z
    .object({
      userId: z.uuid(),
      permissionId: z.uuid(),
      isGranted: z.boolean(),
      id: z.uuid(),
    })
    .merge(
      AuditSchema.pick({
        createdBy: true,
        updatedBy: true,
        deletedBy: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      })
    )
);
