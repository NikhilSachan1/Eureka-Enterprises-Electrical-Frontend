import { z } from 'zod';
import { AuditSchema, dateField, FilterSchema } from '@shared/schemas';
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
  site: z.null().nullable(),
  user: z.null().nullable(),
  files: z.null().nullable(),
  editHistory: z.null().nullable(),
})
  .strict()
  .transform(({ ...rest }) => {
    //ToDo: Remove this transform once the data is updated
    return {
      ...rest,
      createdByUser: {
        id: '00000000-0000-0000-0000-000000000000',
        firstName: 'Unknown',
        lastName: 'Unknown',
        email: 'unknown@example.com',
        employeeId: 'UNKNOWN',
      },
    };
  });

export const DsrGetResponseSchema = z
  .object({
    records: z.array(DsrGetBaseResponseSchema),
    totalRecords: z.number().int().nonnegative(),
  })
  .strict();
