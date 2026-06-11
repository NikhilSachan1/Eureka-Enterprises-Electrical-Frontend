import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';

const { id } = AttendanceBaseSchema.shape;

export const AttendanceDeleteRequestSchema = z
  .object({
    attendanceIds: z.array(id).min(1),
  })
  .strict();

export const AttendanceDeleteResultSchema = z.looseObject({
  attendanceId: id,
  message: z.string(),
});

export const AttendanceDeleteErrorSchema = z.looseObject({
  attendanceId: id,
  error: z.string().min(1),
});

export const AttendanceDeleteResponseSchema = z.looseObject({
  message: z.string().min(1),
  result: z.array(AttendanceDeleteResultSchema),
  errors: z.array(AttendanceDeleteErrorSchema),
});
