import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';

export const AttendanceForceRequestSchema = AttendanceBaseSchema.pick({
  userId: true,
  attendanceDate: true,
  checkInTime: true,
  checkOutTime: true,
  notes: true,
})
  .extend({
    reason: z.string(),
    timezone: z.string(),
  })
  .strict();

export const AttendanceForceResponseSchema = AttendanceBaseSchema.pick({
  checkInTime: true,
  checkOutTime: true,
})
  .extend({
    workDuration: z.number(),
    message: z.string(),
  })
  .strict();
