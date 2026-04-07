import { z } from 'zod';
import { AuditSchema, FilterSchema } from '@shared/schemas';
import { RoleBaseSchema } from './base-role.schema';

const { createdAt, updatedAt, deletedAt } = AuditSchema.shape;
const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const RoleGetRequestSchema = z
  .object({
    roleName: z.array(z.string()).optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(({ roleName, ...rest }) => {
    return {
      ...rest,
      names: roleName,
    };
  });

export const RoleGetBaseResponseSchema = RoleBaseSchema.extend({
  createdAt,
  updatedAt,
  deletedAt,
}).loose();

export const RoleGetResponseSchema = z.looseObject({
  records: z.array(RoleGetBaseResponseSchema),
  totalRecords: z.number(),
  totalPermissions: z.number(),
});
