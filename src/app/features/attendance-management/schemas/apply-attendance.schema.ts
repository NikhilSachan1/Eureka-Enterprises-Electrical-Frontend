import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';

export const AttendanceApplyRequestSchema = AttendanceBaseSchema.pick({
  notes: true,
})
  .extend({
    action: z.enum(['checkIn', 'checkOut']),
  })
  .strict();

export const AttendanceApplyResponseSchema = AttendanceBaseSchema.pick({
  checkInTime: true,
}).extend({
  message: z.string(),
});
