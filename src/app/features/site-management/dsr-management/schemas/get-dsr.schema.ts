import * as z from 'zod';
import {
  dateField,
  FilterSchema,
  UserSchema,
  uuidField,
} from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';
import { DsrBaseSchema } from './base-dsr.schema';
import { ProjectGetBaseResponseSchema } from '@features/site-management/project-management/schemas';

const { sortOrder, sortField, pageSize, page } = FilterSchema.shape;

export const DsrGetRequestSchema = z
  .object({
    projectName: z.string().nullable().optional(),
    employeeNames: z.array(uuidField).optional(),
    /** Report dates in this range; either end may be null (open). */
    dateRange: z.array(dateField.nullable()).nullable().optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
  })
  .strict()
  .transform(({ projectName, employeeNames, dateRange, ...rest }) => {
    const [start, end] = dateRange ?? [];
    return {
      ...rest,
      siteId: projectName,
      userId: employeeNames,
      reportDateFrom: start ? transformDateFormat(start) : undefined,
      reportDateTo: end ? transformDateFormat(end) : undefined,
      includeFiles: true,
      includeSite: true,
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
  site: ProjectGetBaseResponseSchema.pick({
    id: true,
    name: true,
    city: true,
    state: true,
  }),
  user: UserSchema,
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
