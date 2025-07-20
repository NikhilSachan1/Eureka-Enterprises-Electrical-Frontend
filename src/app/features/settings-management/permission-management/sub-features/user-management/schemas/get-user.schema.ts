import { AuditSchema } from '@app/shared/schemas';
import { FilterSchema } from '@app/shared/schemas/filter.schema';
import { z } from 'zod';

export const UserGetBaseResponseSchema = z
  .object({
    id: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    status: z.string(),
    role: z.string(),
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
