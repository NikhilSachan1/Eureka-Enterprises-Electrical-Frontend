import { AuditSchema } from '@shared/schemas';
import { z } from 'zod';

export const UserPermissionsSetRequestSchema = z.object({
  userId: z.string().uuid(),
  userPermissions: z.array(
    z.object({
      permissionId: z.string().uuid(),
      isGranted: z.boolean(),
    })
  ),
});

export const UserPermissionsSetResponseSchema = z.array(
  z
    .object({
      userId: z.string().uuid(),
      permissionId: z.string().uuid(),
      isGranted: z.boolean(),
      id: z.string().uuid(),
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
