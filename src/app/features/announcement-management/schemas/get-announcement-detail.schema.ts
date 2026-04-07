import z from 'zod';
import { AnnouncementBaseSchema } from './base-announcement.schema';
import { AnnouncementGetBaseResponseSchema } from './get-announcement.schema';
import { isoDateTimeField, UserSchema, uuidField } from '@shared/schemas';
import { makeFieldsNullable } from '@shared/utility';

const { id } = AnnouncementBaseSchema.shape;

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
    createdBy: true,
  })
    .extend({
      publishedAt: isoDateTimeField.nullable(),
      expiredAt: isoDateTimeField.nullable(),
      createdByUser: UserSchema.nullable(),
      updatedByUser: makeFieldsNullable(UserSchema).optional(),
      targets: z.array(
        z.looseObject({
          targetId: uuidField,
          targetType: z.string().min(1),
          employeeId: z.string().min(1),
          employeeName: z.string().min(1),
        })
      ),
    })
    .loose();
