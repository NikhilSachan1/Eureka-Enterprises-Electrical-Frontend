import { uuidField } from '@shared/schemas';
import z from 'zod';

export const NotificationMarkStateResponseSchema = z.looseObject({
  message: z.string().trim().min(1),
  id: uuidField,
  count: z.number().int().nonnegative(),
});

export const NotificationReadAllResponseSchema = z.looseObject({
  message: z.string().trim().min(1),
  updated: z.number().int().nonnegative(),
  count: z.number().int().nonnegative(),
});
