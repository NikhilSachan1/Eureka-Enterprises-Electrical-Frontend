import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';

const { status, id } = AttendanceBaseSchema.shape;

export const AttendanceActionBaseRequestSchema = AttendanceBaseSchema.pick({
  approvalStatus: true,
  approvalComment: true,
}).extend({
  attendanceId: id,
});

export const AttendanceActionRequestSchema = z
  .object({
    approvals: z.array(AttendanceActionBaseRequestSchema),
  })
  .strict();

export const AttendanceActionResultSchema = AttendanceBaseSchema.pick({
  approvalStatus: true,
})
  .extend({
    message: z.string(),
    attendanceId: id,
    newStatus: status,
  })
  .strict();

export const AttendanceActionErrorSchema = z.object({
  attendanceId: id,
  error: z.string(),
});

export const AttendanceActionResponseSchema = z
  .object({
    message: z.string(),
    results: z.array(AttendanceActionResultSchema),
    errors: z.array(AttendanceActionErrorSchema),
  })
  .strict();
