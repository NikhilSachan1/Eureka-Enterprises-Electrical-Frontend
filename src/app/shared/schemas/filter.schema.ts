import { APP_CONFIG } from '@core/config';
import { z } from 'zod';

export const FilterSchema = z.object({
  sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
  sortField: z.string().optional(),
  pageSize: z
    .number()
    .min(1)
    .default(APP_CONFIG.TABLE_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE),
  page: z.number().min(1).default(1),
  search: z.string().nullable().optional(),
});
