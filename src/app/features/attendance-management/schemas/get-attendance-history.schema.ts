import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';
import { UserSchema } from '@shared/schemas';

const { attendanceDate } = AttendanceBaseSchema.shape;

export const AttendanceHistoryGetRequestSchema = AttendanceBaseSchema.pick({
  userId: true,
}).extend({
  date: attendanceDate,
});

export const AttendanceHistoryGetResponseSchema = z
  .object({
    records: z.array(
      AttendanceBaseSchema.extend({
        user: UserSchema,
        createdByUser: UserSchema,
        approvalByUser: UserSchema,
      })
    ),
    totalRecords: z.number(),
  })
  .strict();
