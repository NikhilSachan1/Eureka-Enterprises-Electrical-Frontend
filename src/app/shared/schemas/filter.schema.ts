import { z } from 'zod';

export const FilterSchema = z.object({
  sortOrder: z.enum(['ASC', 'DESC']).default('ASC'),
  sortField: z.string().optional(),
  pageSize: z.number().min(1).default(10),
  page: z.number().min(1).default(1),
  search: z.string().optional(),
});
