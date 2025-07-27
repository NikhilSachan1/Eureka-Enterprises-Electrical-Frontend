import { AuditSchema } from '@shared/schemas';
import { z } from 'zod';

export const UserPermissionsSetRequestSchema = z.object({
  userId: z.uuid(),
  userPermissions: z.array(
    z.object({
      permissionId: z.uuid(),
      isGranted: z.boolean(),
    })
  ),
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
