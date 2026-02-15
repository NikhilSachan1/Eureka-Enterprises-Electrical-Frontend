import { AuditSchema, uuidField } from '@shared/schemas';
import { z } from 'zod';

export const { createdAt, updatedAt } = AuditSchema.shape;

export const UserGetBaseResponseSchema = z
  .object({
    id: uuidField,
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    status: z.string(),
    role: z.string().nullable(), // TODO: Remove this nullable once the role is added to the user
    rolePermissionsCount: z.number(),
    userPermissionsCount: z.number(),
    totalPermissions: z.number(),
    createdAt,
    updatedAt,
  })
  .strict();

export const UserGetResponseSchema = z
  .object({
    records: z.array(UserGetBaseResponseSchema),
    totalRecords: z.number(),
    systemTotalPermissions: z.number(),
  })
  .strict();
