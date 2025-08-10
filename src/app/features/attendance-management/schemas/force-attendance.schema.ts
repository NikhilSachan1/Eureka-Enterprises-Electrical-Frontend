import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';

export const AttendanceForceRequestSchema = AttendanceBaseSchema.pick({
  attendanceDate: true,
  checkInTime: true,
  checkOutTime: true,
  notes: true,
})
  .extend({
    userIds: z.array(z.string()),
    reason: z.string(),
    timezone: z.string(),
  })
  .strict();

export const AttendanceForceResponseSchema = z.object({
  message: z.string(),
});
