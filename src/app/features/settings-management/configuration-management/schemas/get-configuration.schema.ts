import { FilterSchema } from '@shared/schemas';
import z from 'zod';
import { ConfigurationBaseSchema } from './base-configuration.schema';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const ConfigurationGetRequestSchema = z
  .object({
    moduleName: z.array(z.string()).optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(({ moduleName, ..._rest }) => {
    return {
      // ...rest, //TODO: Uncomment this when the rest of the fields are added
      module: moduleName,
    };
  });

export const ConfigurationGetBaseResponseSchema = ConfigurationBaseSchema;

export const ConfigurationGetResponseSchema = z
  .object({
    records: z.array(ConfigurationBaseSchema),
    totalRecords: z.number().int().nonnegative(),
  })
  .strict();
