import z from 'zod';
import { AnnouncementBaseSchema } from './base-announcement.schema';
import { AuditSchema } from '@shared/schemas';

const { createdAt } = AuditSchema.shape;

export const AnnouncementUnacknowledgeGetBaseResponseSchema = z
  .object({
    ...AnnouncementBaseSchema.shape,
    createdAt,
  })
  .strict();

export const AnnouncementUnacknowledgeGetResponseSchema = z
  .object({
    records: z.array(AnnouncementUnacknowledgeGetBaseResponseSchema),
    totalRecords: z.number(),
  })
  .strict();
