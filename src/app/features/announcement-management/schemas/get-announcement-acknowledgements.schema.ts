import { isoDateTimeField, uuidField } from '@shared/schemas';
import z from 'zod';

export const AnnouncementAcknowledgementRecordSchema = z.looseObject({
  userId: uuidField,
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  acknowledged: z.boolean(),
  acknowledgedAt: isoDateTimeField.nullable(),
});

export const AnnouncementAcknowledgementsGetResponseSchema = z.looseObject({
  records: z.array(AnnouncementAcknowledgementRecordSchema),
  totalRecords: z.number(),
  acknowledged: z.number(),
  pending: z.number(),
});
