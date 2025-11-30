import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';
import { uuidField } from '@shared/schemas';

const { attendanceDate, checkInTime, checkOutTime, notes, status } =
  AttendanceBaseSchema.shape;

export const AttendanceForceRequestSchema = z
  .object({
    attendanceDate,
    checkInTime,
    checkOutTime,
    notes,
    status,
    userIds: z.array(uuidField).min(1).max(100),
    reason: z.string(),
    timezone: z.string(),
  })
  .strict();

export const AttendanceForceResponseSchema = z
  .object({
    message: z.string().min(1),
  })
  .strict();
