import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';
import { onlyTimeStringField } from '@shared/schemas/common.schema';

const { id, notes, status, userId } = AttendanceBaseSchema.shape;

export const AttendanceRegularizedRequestSchema = z
  .object({
    checkInTime: onlyTimeStringField,
    checkOutTime: onlyTimeStringField,
    notes,
    status,
    userId,
  })
  .strict();

export const AttendanceRegularizedResponseSchema = z
  .object({
    message: z.string().min(1),
    attendanceId: id,
  })
  .strict();
