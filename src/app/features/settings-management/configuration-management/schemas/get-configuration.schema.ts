import { FilterSchema } from '@shared/schemas';
import z from 'zod';
import { ConfigurationBaseSchema } from './base-configuration.schema';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const ConfigurationGetRequestSchema = z
  .object({
    moduleName: z.array(z.string()).optional(),
    key: z.union([z.string(), z.array(z.string())]).optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(({ moduleName, key, ...rest }) => {
    return {
      ...rest,
      ...(moduleName ? { module: moduleName } : {}),
      ...(key !== undefined ? { key } : {}),
    };
  });

export const ConfigurationGetBaseResponseSchema = ConfigurationBaseSchema;

export const ConfigurationGetResponseSchema = z.looseObject({
  records: z.array(ConfigurationBaseSchema),
  totalRecords: z.number().int().nonnegative(),
});
