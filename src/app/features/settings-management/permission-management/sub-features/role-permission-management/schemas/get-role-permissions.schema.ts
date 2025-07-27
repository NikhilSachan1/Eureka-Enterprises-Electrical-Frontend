import { z } from 'zod';
import { RolePermissionsBaseSchema } from './base-role-permission.schema';

export const RolePermissionsGetRequestSchema = z
  .object({
    roleId: z.uuid(),
    isActive: z.boolean(),
  })
  .strict();

export const RolePermissionsGetResponseSchema = z.object({
  records: z.array(RolePermissionsBaseSchema),
  totalRecords: z.number(),
});
