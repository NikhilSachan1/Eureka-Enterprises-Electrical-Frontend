import { dateField, isoDateTimeField, uuidField } from '@shared/schemas';
import z from 'zod';

export const AnnouncementBaseSchema = z
  .object({
    id: uuidField,
    title: z.string().min(1),
    message: z.string().min(1),
    status: z.string().min(1),
    startAt: isoDateTimeField,
    expiryAt: isoDateTimeField,
  })
  .strict();

export const AnnouncementUpsertShapeSchema = z
  .object({
    title: z.string().min(1),
    content: z.string().min(1),
    announcementDate: z.array(dateField),
    announcementSentTo: z.array(uuidField),
  })
  .strict();
