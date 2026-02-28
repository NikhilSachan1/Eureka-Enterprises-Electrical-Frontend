import z from 'zod';
import { AnnouncementBaseSchema } from './base-announcement.schema';
import { AnnouncementGetBaseResponseSchema } from './get-announcement.schema';
import { AuditSchema, isoDateTimeField, uuidField } from '@shared/schemas';

const { id } = AnnouncementBaseSchema.shape;
const { updatedBy, deletedBy, deletedAt } = AuditSchema.shape;

export const AnnouncementDetailGetRequestSchema = z
  .object({
    announcementId: id,
  })
  .strict()
  .transform(data => {
    return {
      id: data.announcementId,
    };
  });

export const AnnouncementDetailGetResponseSchema =
  AnnouncementGetBaseResponseSchema.omit({
    stats: true,
  })
    .extend({
      updatedBy,
      deletedBy,
      deletedAt,
      publishedAt: isoDateTimeField.nullable(),
      expiredAt: isoDateTimeField.nullable(),
      targets: z.array(
        z
          .object({
            id: uuidField,
            targetType: z.string().min(1),
            targetId: uuidField,
            announcementId: uuidField,
            ...AuditSchema.shape,
          })
          .strict()
      ),
    })
    .strict();
