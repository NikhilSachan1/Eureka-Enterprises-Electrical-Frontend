import { z } from 'zod';
import { AnnouncementUpsertShapeSchema } from './base-announcement.schema';
import { transformDateFormat } from '@shared/utility';

export const AnnouncementEditRequestSchema =
  AnnouncementUpsertShapeSchema.strict().transform(data => {
    const [startAt, expiryAt] = data.announcementDate ?? [];
    return {
      title: data.title,
      message: data.content,
      startAt: transformDateFormat(startAt),
      expiryAt: transformDateFormat(expiryAt),
      targets: data.announcementSentTo.map(targetId => ({
        targetType: 'USER' as const,
        targetId,
      })),
    };
  });

export const AnnouncementEditResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
