import { UserSchema } from '@shared/schemas';
import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';
import { makeFieldsNullable } from '@shared/utility/zod.util';
import { AssignmentSnapshotSchema } from './apply-attendance.schema';

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
    assignmentSnapshot: AssignmentSnapshotSchema.nullable(),
    createdByUser: makeFieldsNullable(UserSchema).nullable().optional(),
    updatedByUser: makeFieldsNullable(UserSchema).nullable().optional(),
    approvalByUser: makeFieldsNullable(UserSchema).nullable().optional(),
  }).strict()
);
