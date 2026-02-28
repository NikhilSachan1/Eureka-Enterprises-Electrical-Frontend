import { AuditSchema, FilterSchema, uuidField } from '@shared/schemas';
import z from 'zod';
import { AnnouncementBaseSchema } from './base-announcement.schema';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;
const { createdAt, updatedAt, createdBy } = AuditSchema.shape;

export const AnnouncementGetRequestSchema = z
  .object({
    announcementStatus: z.array(z.string()).min(1).optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(({ announcementStatus, ...rest }) => {
    return {
      ...rest,
      status: announcementStatus,
    };
  });

const AnnouncementStatsSchema = z
  .object({
    total: z.number(),
    acknowledged: z.number(),
    pending: z.number(),
  })
  .strict();

export const AnnouncementGetBaseResponseSchema = z
  .object({
    ...AnnouncementBaseSchema.shape,
    stats: AnnouncementStatsSchema,
    targets: z.array(
      z
        .object({
          id: uuidField,
          targetType: z.string().min(1),
          targetId: uuidField,
        })
        .strict()
    ),
    createdAt,
    updatedAt,
    createdBy,
  })
  .strict();

export const AnnouncementGetStatsResponseSchema = z
  .object({
    total: z.number(),
    acknowledged: z.number(),
    pending: z.number(),
  })
  .strict();

export const AnnouncementGetResponseSchema = z
  .object({
    records: z.array(AnnouncementGetBaseResponseSchema),
    stats: AnnouncementGetStatsResponseSchema.optional(),
    totalRecords: z.number().int().nonnegative(),
  })
  .strict();
