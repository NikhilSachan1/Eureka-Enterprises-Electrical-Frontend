import { z } from 'zod';
import { uuidField } from '@shared/schemas';

export const AnnouncementAcknowledgeRequestSchema = z.object({
  announcementId: uuidField,
});

export const AnnouncementAcknowledgeResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
