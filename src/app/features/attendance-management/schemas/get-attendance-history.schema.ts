import { UserSchema } from '@shared/schemas';
import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';

const { userId, attendanceDate } = AttendanceBaseSchema.shape;

export const AttendanceHistoryGetRequestSchema = z
  .object({
    userId,
    date: attendanceDate,
  })
  .strict();

export const AttendanceHistoryGetResponseSchema = z.array(
  AttendanceBaseSchema.extend({
    user: UserSchema,
    createdByUser: UserSchema,
    approvalByUser: UserSchema,
  }).strict()
);
