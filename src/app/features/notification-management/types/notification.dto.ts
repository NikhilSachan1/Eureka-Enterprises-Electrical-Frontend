import { z } from 'zod';
import {
  NotificationGetRequestSchema,
  NotificationGetResponseSchema,
  NotificationListItemSchema,
  NotificationMarkStateResponseSchema,
  NotificationReadAllResponseSchema,
} from '../schemas';

export type INotificationListItemDto = z.infer<typeof NotificationListItemSchema>;
export type INotificationGetFormDto = z.infer<typeof NotificationGetRequestSchema>;
export type INotificationGetResponseDto = z.infer<
  typeof NotificationGetResponseSchema
>;
export type INotificationMarkStateResponseDto = z.infer<
  typeof NotificationMarkStateResponseSchema
>;
export type INotificationReadAllResponseDto = z.infer<
  typeof NotificationReadAllResponseSchema
>;

export type NotificationListStatus = 'all' | 'unread';
