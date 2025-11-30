import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';

const { id, checkInTime, checkOutTime, notes, status, userId } =
  AttendanceBaseSchema.shape;

export const AttendanceRegularizedRequestSchema = z
  .object({
    checkInTime,
    checkOutTime,
    notes,
    status,
    userId,
    timezone: z.string(),
  })
  .strict();

export const AttendanceRegularizedResponseSchema = z
  .object({
    message: z.string().min(1),
    attendanceId: id,
  })
  .strict();
