import { AuditSchema, FilterSchema } from '@shared/schemas';
import { toTitleCase } from '@shared/utility';
import { z } from 'zod';

export const UserGetBaseResponseSchema = z
  .object({
    id: z.uuid(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    status: z.string().transform(val => toTitleCase(val)),
    role: z.string().transform(val => toTitleCase(val)),
    rolePermissionsCount: z.number(),
    userPermissionsCount: z.number(),
    totalPermissions: z.number(),
  })
  .merge(
    AuditSchema.pick({
      createdAt: true,
      updatedAt: true,
    })
  )
  .strict();

export const UserGetRequestSchema = FilterSchema.pick({
  sortOrder: true,
  sortField: true,
});

export const UserGetResponseSchema = z
  .object({
    records: z.array(UserGetBaseResponseSchema),
    totalRecords: z.number(),
    systemTotalPermissions: z.number(),
  })
  .strict();
