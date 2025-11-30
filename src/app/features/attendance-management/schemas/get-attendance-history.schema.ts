import { UserSchema, onlyDateStringField } from '@shared/schemas';
import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';
import { makeFieldsNullable } from '@shared/utility/zod.util';

const { userId } = AttendanceBaseSchema.shape;

export const AttendanceHistoryGetRequestSchema = z
  .object({
    userId,
    date: onlyDateStringField,
  })
  .strict();

export const AttendanceHistoryGetResponseSchema = z.array(
  AttendanceBaseSchema.extend({
    attendanceDate: onlyDateStringField, // TODO: remove this field
    user: UserSchema,
    createdByUser: UserSchema,
    approvalByUser: makeFieldsNullable(UserSchema).nullable(),
  }).strict()
);
