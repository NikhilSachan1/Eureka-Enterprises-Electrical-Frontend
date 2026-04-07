import z from 'zod';
import { AnnouncementBaseSchema } from './base-announcement.schema';
import { AuditSchema } from '@shared/schemas';

const { createdAt } = AuditSchema.shape;

export const AnnouncementUnacknowledgeGetBaseResponseSchema = z.looseObject({
  ...AnnouncementBaseSchema.shape,
  createdAt,
});

export const AnnouncementUnacknowledgeGetResponseSchema = z.looseObject({
  records: z.array(AnnouncementUnacknowledgeGetBaseResponseSchema),
  totalRecords: z.number(),
});
