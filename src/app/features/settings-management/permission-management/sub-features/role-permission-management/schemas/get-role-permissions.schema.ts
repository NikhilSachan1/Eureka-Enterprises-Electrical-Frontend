import { z } from 'zod';
import { RolePermissionsBaseSchema } from './base-role-permission.schema';
import { AuditSchema, uuidField } from '@shared/schemas';

export const RolePermissionsGetRequestSchema = z
  .object({
    roleId: uuidField,
  })
  .strict()
  .transform(data => ({
    ...data,
    isActive: true,
  }));

export const RolePermissionsGetBaseResponseSchema =
  RolePermissionsBaseSchema.extend(AuditSchema.shape).strict();

export const RolePermissionsGetResponseSchema = z
  .object({
    records: z.array(RolePermissionsGetBaseResponseSchema),
    totalRecords: z.number(),
  })
  .strict();
