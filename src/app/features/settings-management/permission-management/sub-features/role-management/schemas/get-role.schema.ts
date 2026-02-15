import { z } from 'zod';
import { AuditSchema } from '@shared/schemas';
import { RoleBaseSchema } from './base-role.schema';

const { createdAt, updatedAt, deletedAt } = AuditSchema.shape;

export const RoleGetBaseResponseSchema = RoleBaseSchema.extend({
  createdAt,
  updatedAt,
  deletedAt,
}).strict();

export const RoleGetResponseSchema = z
  .object({
    records: z.array(RoleGetBaseResponseSchema),
    totalRecords: z.number(),
    totalPermissions: z.number(),
  })
  .strict();
