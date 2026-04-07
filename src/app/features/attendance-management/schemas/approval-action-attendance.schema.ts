import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';

const { id, approvalStatus, approvalComment } = AttendanceBaseSchema.shape;

export const AttendanceActionRequestSchema = z
  .object({
    attendanceIds: z.array(id),
    approvalStatus,
    remark: approvalComment,
  })
  .strict()
  .transform(data => ({
    approvals: data.attendanceIds.map(attendanceId => ({
      attendanceId,
      approvalStatus: data.approvalStatus,
      approvalComment: data.remark,
    })),
  }));

export const AttendanceActionResultSchema = z.looseObject({
  approvalStatus,
  message: z.string(),
  attendanceId: id,
  newStatus: z.string(),
});

export const AttendanceActionErrorSchema = z.looseObject({
  attendanceId: id,
  error: z.string().min(1),
});

export const AttendanceActionResponseSchema = z.looseObject({
  message: z.string().min(1),
  result: z.array(AttendanceActionResultSchema),
  errors: z.array(AttendanceActionErrorSchema),
});
