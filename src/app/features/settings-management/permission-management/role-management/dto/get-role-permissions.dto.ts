import { z } from 'zod';
import { AuditFieldsSchema } from '@shared/dto';

export const RolePermissionsBaseResponseSchema = z
  .object({
    id: z.string().uuid(),
    roleId: z.string().uuid(),
    permissionId: z.string().uuid(),
    isActive: z.boolean(),
  })
  .merge(AuditFieldsSchema)
  .strict();

export const GetRolePermissionRequestSchema = z
  .object({
    roleId: z.string().uuid(),
    isActive: z.boolean(),
  })
  .strict();

export const GetRolePermissionsResponseSchema = z.object({
  records: z.array(RolePermissionsBaseResponseSchema),
  totalRecords: z.number(),
});
