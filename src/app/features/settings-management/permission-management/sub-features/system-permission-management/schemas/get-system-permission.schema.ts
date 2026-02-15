import { z } from 'zod';
import { AuditSchema } from '@shared/schemas';
import { SystemPermissionBaseSchema } from './base-system-permission.schema';

export const SystemPermissionGetBaseResponseSchema =
  SystemPermissionBaseSchema.extend(AuditSchema.shape).strict();

export const SystemPermissionGetResponseSchema = z
  .object({
    records: z.array(SystemPermissionGetBaseResponseSchema),
    totalRecords: z.number().min(0),
  })
  .strict();
