import z from 'zod';
import { AnnouncementBaseSchema } from './base-announcement.schema';

export const AnnouncementUnacknowledgeGetRequestSchema = z.object({}).strict();

export const AnnouncementUnacknowledgeGetBaseResponseSchema = z
  .object({
    ...AnnouncementBaseSchema.shape,
  })
  .strict();

export const AnnouncementUnacknowledgeGetStatsResponseSchema = z
  .object({})
  .strict();

export const AnnouncementUnacknowledgeGetResponseSchema = z.object({}).strict();
