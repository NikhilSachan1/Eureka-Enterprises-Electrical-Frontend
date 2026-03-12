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
      includeFiles: true,
    };
  });

export const DsrGetBaseResponseSchemaInner = DsrBaseSchema.extend({
  ...AuditSchema.shape,
  site: z.unknown().nullable(),
  user: z.unknown().nullable(),
  files: z
    .array(
      z.looseObject({
        id: z.string(),
        fileKey: z.string(),
        fileName: z.string(),
        fileType: z.string(),
      })
    )
    .nullable(),
  editHistory: z.array(z.unknown()).nullable(),
  createdByUser: UserSchema,
}).loose();

export const DsrGetBaseResponseSchema = DsrGetBaseResponseSchemaInner.transform(
  ({ files, ...rest }) => ({
    ...rest,
    documentKeys: files?.map(file => file.fileKey) ?? [],
  })
);

export const DsrGetResponseSchema = z
  .object({
    records: z.array(DsrGetBaseResponseSchema),
    totalRecords: z.number().int().nonnegative(),
  })
  .strict();
