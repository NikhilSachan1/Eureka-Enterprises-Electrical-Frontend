import { AuditSchema } from '@app/shared/schemas';
import z from 'zod';

export const RolePermissionsBaseSchema = z
  .object({
    id: z.string().uuid(),
    roleId: z.string().uuid(),
    permissionId: z.string().uuid(),
    isActive: z.boolean(),
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
  .strict();
