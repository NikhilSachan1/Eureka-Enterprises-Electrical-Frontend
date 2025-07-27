import { AuditSchema } from '@shared/schemas';
import z from 'zod';

export const RolePermissionsBaseSchema = z
  .object({
    id: z.uuid(),
    roleId: z.uuid(),
    permissionId: z.uuid(),
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
