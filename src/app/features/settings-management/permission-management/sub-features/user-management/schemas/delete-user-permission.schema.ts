import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const UserPermissionDeleteRequestSchema = z
  .object({
    employeeNames: z.array(uuidField).min(1),
  })
  .strict()
  .transform(data => ({
    userIds: data.employeeNames,
  }));

export const UserPermissionDeleteResponseSchema = z
  .object({
    message: z.string(),
    totalDeleted: z.number(),
    deletedCounts: z.record(uuidField, z.number()),
  })
  .strict();
