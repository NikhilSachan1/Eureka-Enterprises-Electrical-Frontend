import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';

export const AttendanceRegularizedRequestSchema = AttendanceBaseSchema.pick({
  checkInTime: true,
  checkOutTime: true,
  notes: true,
  status: true,
  userId: true,
})
  .extend({
    timezone: z.string(),
  })
  .strict();

const { id } = AttendanceBaseSchema.shape;

export const AttendanceRegularizedResponseSchema = z.object({
  message: z.string(),
  attendanceId: id,
});
