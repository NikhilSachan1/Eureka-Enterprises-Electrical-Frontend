import { z } from 'zod';
import { AnnouncementBaseSchema } from './base-announcement.schema';
import { uuidField } from '@shared/schemas';
import { CompanyDeleteResultSchema } from '@features/site-management/company-management/schemas/delete-company.schema';

const { id } = AnnouncementBaseSchema.shape;

export const AnnouncementDeleteRequestSchema = z
  .object({
    announcementIds: z.array(id).min(1),
  })
  .strict()
  .transform(({ announcementIds }) => {
    return {
      ids: announcementIds,
    };
  });

export const AnnouncementDeleteResultSchema = z.looseObject({
  id: uuidField,
  message: z.string(),
  success: z.boolean(),
});

export const AnnouncementDeleteResponseSchema = z.looseObject({
  message: z.string(),
  failureCount: z.number().int().nonnegative(),
  successCount: z.number().int().nonnegative(),
  totalRequested: z.number().int().nonnegative(),
  results: z.array(CompanyDeleteResultSchema),
});
