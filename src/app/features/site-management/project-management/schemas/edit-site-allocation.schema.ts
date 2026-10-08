import { z } from 'zod';
import { dateField } from '@shared/schemas';
import { transformDateFormat } from '@shared/utility';

export const SiteAllocationEditRequestSchema = z
  .object({
    role: z.string().trim().min(1),
    allocateDate: dateField,
    releaseDate: dateField.nullable().optional(),
  })
  .strict()
  .transform(data => ({
    role: data.role,
    allocatedAt: transformDateFormat(data.allocateDate),
    deallocatedAt: data.releaseDate
      ? transformDateFormat(data.releaseDate)
      : null,
  }));

export const SiteAllocationEditResponseSchema = z.looseObject({
  message: z.string(),
});
