import { z } from 'zod';
import {
  AuditSchema,
  dateField,
  FilterSchema,
  UserSchema,
} from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';
import { DsrBaseSchema } from './base-dsr.schema';

const { sortOrder, sortField, pageSize, page } = FilterSchema.shape;

export const DsrGetRequestSchema = z
  .object({
    projectName: z.string().optional(),
    employeeName: z.array(z.string()).optional(),
    statusDate: z.array(dateField).optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
  })
  .strict()
  .transform(({ projectName, employeeName, statusDate, ...rest }) => {
    const [start, end] = statusDate ?? [];
    return {
      ...rest,
      siteId: projectName,
      userId: employeeName,
      reportDateFrom: transformDateFormat(start),
      reportDateTo: transformDateFormat(end),
    };
  });

export const DsrGetBaseResponseSchema = DsrBaseSchema.extend({
  ...AuditSchema.shape,
  user: z.null().nullable(),
  files: z.array(z.string()),
  createdByUser: UserSchema,
  editHistory: z.array(z.any()).nullable(),
}).loose();

export const DsrGetResponseSchema = z
  .object({
    records: z.array(DsrGetBaseResponseSchema),
    totalRecords: z.number().int().nonnegative(),
  })
  .strict();
