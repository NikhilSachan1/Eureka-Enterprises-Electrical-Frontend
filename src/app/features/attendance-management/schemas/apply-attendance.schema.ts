import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';
import { EApplyAttendanceAction } from '../types/attendance.enum';

const { notes, checkInTime } = AttendanceBaseSchema.shape;

export const AttendanceApplyRequestSchema = z.object({
  notes,
  action: z.enum(EApplyAttendanceAction),
});

export const AttendanceApplyResponseSchema = z.object({
  checkInTime,
  message: z.string(),
});
