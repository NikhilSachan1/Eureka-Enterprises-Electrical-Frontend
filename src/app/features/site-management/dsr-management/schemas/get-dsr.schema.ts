import { z } from 'zod';
import {
  dateField,
  FilterSchema,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';
import { DsrBaseSchema } from './base-dsr.schema';

const { sortOrder, sortField, pageSize, page } = FilterSchema.shape;

export const DsrGetRequestSchema = z
  .object({
    projectName: z.string().nullable().optional(),
    employeeName: z.array(z.string()).nullable().optional(),
    dateRange: z.array(dateField).nullable().optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
  })
  .strict()
  .transform(({ projectName, employeeName, dateRange, ...rest }) => {
    const [start, end] = dateRange ?? [];
    return {
      ...rest,
      siteId: projectName,
      userId: employeeName,
      reportDateFrom: transformDateFormat(start),
      reportDateTo: transformDateFormat(end),
      includeFiles: true,
      inscludeSites: true,
    };
  });

export const DsrGetBaseResponseSchema = DsrBaseSchema.extend({
  files: z.array(
    z.looseObject({
      id: uuidField,
      fileKey: z.string(),
      fileType: z.string(),
      fileName: z.string().nullable(),
    })
  ),
  createdByUser: UserSchema,
  editHistory: z.array(z.any()).nullable(),
})
  .loose()
  .transform(({ files, ...rest }) => ({
    ...rest,
    documentKeys: files.map(file => file.fileKey),
  }));

export const DsrGetResponseSchema = z.looseObject({
  records: z.array(DsrGetBaseResponseSchema),
  totalRecords: z.number().int().nonnegative(),
});
