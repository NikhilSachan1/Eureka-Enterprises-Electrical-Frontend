import z from 'zod';
import { NotificationListItemSchema } from './base-notification.schema';

export const NotificationGetRequestSchema = z
  .object({
    status: z.enum(['all', 'unread', 'read']).optional(),
    page: z.number().int().positive().optional(),
    pageSize: z.number().int().positive().max(1000).optional(),
  })
  .strict();

export const NotificationGetResponseSchema = z.looseObject({
  records: z.array(NotificationListItemSchema),
  totalRecords: z.number().int().nonnegative(),
  unreadCount: z.number().int().nonnegative(),
});
