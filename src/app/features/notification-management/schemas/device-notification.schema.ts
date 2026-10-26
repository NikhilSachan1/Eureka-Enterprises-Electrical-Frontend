import z from 'zod';

export const NotificationDevicePlatformSchema = z.enum([
  'android',
  'ios',
  'web',
]);

export const NotificationRegisterDeviceRequestSchema = z.object({
  token: z.string().trim().min(1),
  platform: NotificationDevicePlatformSchema,
  deviceName: z.string().trim().max(120).optional(),
  appVersion: z.string().trim().max(40).optional(),
});

export const NotificationRegisterDeviceResponseSchema = z.looseObject({
  message: z.string().trim().min(1),
  id: z.string().trim().min(1),
  pushEnabled: z.boolean(),
});

export const NotificationUnregisterDeviceResponseSchema = z.looseObject({
  message: z.string().trim().min(1),
});
