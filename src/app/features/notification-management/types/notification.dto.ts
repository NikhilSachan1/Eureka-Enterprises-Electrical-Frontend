import { z } from 'zod';
import {
  NotificationGetRequestSchema,
  NotificationGetResponseSchema,
  NotificationListItemSchema,
  NotificationMarkStateResponseSchema,
  NotificationReadAllResponseSchema,
  NotificationRegisterDeviceRequestSchema,
  NotificationRegisterDeviceResponseSchema,
  NotificationUnregisterDeviceResponseSchema,
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
export type INotificationRegisterDeviceFormDto = z.infer<
  typeof NotificationRegisterDeviceRequestSchema
>;
export type INotificationRegisterDeviceResponseDto = z.infer<
  typeof NotificationRegisterDeviceResponseSchema
>;
export type INotificationUnregisterDeviceResponseDto = z.infer<
  typeof NotificationUnregisterDeviceResponseSchema
>;

export type NotificationListStatus = 'all' | 'unread';
