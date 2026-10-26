import { uuidField } from '@shared/schemas';
import z from 'zod';

export const NotificationListItemSchema = z.looseObject({
  id: uuidField,
  title: z.string().trim().min(1).max(120),
  message: z.string().trim().max(500),
  category: z.string().trim().min(1),
  referenceType: z.string().trim().min(1).nullable().optional(),
  referenceId: uuidField.nullable().optional(),
  route: z.string().trim().nullable().optional(),
  data: z.record(z.string(), z.unknown()).nullable().optional(),
  isRead: z.boolean(),
  readAt: z.iso.datetime().nullable().optional(),
  createdAt: z.iso.datetime(),
});
