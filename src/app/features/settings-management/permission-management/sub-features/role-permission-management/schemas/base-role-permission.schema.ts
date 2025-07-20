import { AuditFieldsSchema } from '@app/shared/dto';
import z from 'zod';

export const RolePermissionsBaseSchema = z
  .object({
    id: z.string().uuid(),
    roleId: z.string().uuid(),
    permissionId: z.string().uuid(),
    isActive: z.boolean(),
  })
  .merge(
    AuditFieldsSchema.pick({
      createdBy: true,
      updatedBy: true,
      deletedBy: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    })
  )
  .strict();
