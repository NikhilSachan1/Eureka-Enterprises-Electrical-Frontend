import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';

export const AttendanceForceRequestSchema = AttendanceBaseSchema.pick({
  userId: true,
  attendanceDate: true,
  checkInTime: true,
  checkOutTime: true,
  approvalComment: true,
  notes: true,
}).strict();

export const AttendanceForceResponseSchema = AttendanceBaseSchema.pick({
  checkInTime: true,
  checkOutTime: true,
})
  .extend({
    workDuration: z.number(),
    message: z.string(),
  })
  .strict();
