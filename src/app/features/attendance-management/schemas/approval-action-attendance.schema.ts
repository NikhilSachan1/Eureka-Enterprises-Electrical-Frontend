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

export const AttendanceActionResultSchema = z
  .object({
    approvalStatus,
    message: z.string(),
    attendanceId: id,
    newStatus: z.string(),
  })
  .strict();

export const AttendanceActionErrorSchema = z
  .object({
    attendanceId: id,
    error: z.string().min(1),
  })
  .strict();

export const AttendanceActionResponseSchema = z
  .object({
    message: z.string().min(1),
    result: z.array(AttendanceActionResultSchema),
    errors: z.array(AttendanceActionErrorSchema),
  })
  .strict();
