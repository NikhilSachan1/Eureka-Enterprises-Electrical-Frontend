import { UserSchema } from '@shared/schemas';
import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';
import { makeFieldsNullable } from '@shared/utility/zod.util';

const { userId, attendanceDate, notes } = AttendanceBaseSchema.shape;

export const AttendanceHistoryGetRequestSchema = z
  .object({
    userId,
    date: attendanceDate,
  })
  .strict();

export const AttendanceHistoryGetResponseSchema = z.array(
  AttendanceBaseSchema.extend({
    notes: notes.nullable(), // ToDo: remove this nullable after backend is updated
    user: UserSchema,
    updatedByUser: makeFieldsNullable(UserSchema).nullable().optional(),
    approvalByUser: makeFieldsNullable(UserSchema).nullable().optional(),
  }).loose()
);
