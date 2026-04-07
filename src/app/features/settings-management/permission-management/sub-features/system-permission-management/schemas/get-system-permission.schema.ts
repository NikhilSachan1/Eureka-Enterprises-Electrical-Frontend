import { z } from 'zod';
import { AuditSchema, FilterSchema } from '@shared/schemas';
import { SystemPermissionBaseSchema } from './base-system-permission.schema';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const SystemPermissionGetRequestSchema = z
  .object({
    moduleName: z.array(z.string()).optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(({ moduleName, ...rest }) => {
    return {
      ...rest,
      module: moduleName,
    };
  });

export const SystemPermissionGetBaseResponseSchema =
  SystemPermissionBaseSchema.extend(AuditSchema.shape).loose();

export const SystemPermissionGetResponseSchema = z.looseObject({
  records: z.array(SystemPermissionGetBaseResponseSchema),
  totalRecords: z.number().min(0),
});
