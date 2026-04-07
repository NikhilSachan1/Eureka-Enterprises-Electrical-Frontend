import { z } from 'zod';
import { AuditSchema, FilterSchema } from '@shared/schemas';
import { DocBaseSchema } from './base-doc.schema';

const { sortOrder, sortField, pageSize, page } = FilterSchema.shape;

export const DocGetRequestSchema = z
  .object({
    projectName: z.string().optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
  })
  .strict()
  .transform(({ projectName, ...rest }) => {
    return {
      ...rest,
      siteId: projectName,
    };
  });

export const DocGetBaseResponseSchema = DocBaseSchema.extend({
  ...AuditSchema.shape,
}).loose();

export const DocGetResponseSchema = z.looseObject({
  records: z.array(DocGetBaseResponseSchema),
  totalRecords: z.number().int().nonnegative(),
});
