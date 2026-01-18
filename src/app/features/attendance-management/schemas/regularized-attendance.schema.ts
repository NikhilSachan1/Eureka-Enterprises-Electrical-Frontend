import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';
import { SHIFT_DATA } from '@shared/config';

const { id, status, userId } = AttendanceBaseSchema.shape;

export const AttendanceRegularizedRequestSchema = z
  .object({
    attendanceStatus: status,
    employeeName: userId,
  })
  .strict()
  .transform(data => ({
    status: data.attendanceStatus,
    checkInTime: SHIFT_DATA.START_TIME,
    checkOutTime: SHIFT_DATA.END_TIME,
    userId: data.employeeName,
  }));

export const AttendanceRegularizedResponseSchema = z
  .object({
    message: z.string().min(1),
    attendanceId: id,
  })
  .strict();
