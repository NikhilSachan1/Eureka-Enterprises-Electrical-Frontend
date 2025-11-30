import { z } from 'zod';
import {
  AttendanceBaseSchema,
  attendanceStatusSchema,
} from './base-attendance.schema';

const { id, approvalStatus, approvalComment } = AttendanceBaseSchema.shape;

export const AttendanceActionBaseRequestSchema = z
  .object({
    approvalStatus,
    approvalComment,
    attendanceId: id,
  })
  .strict();

export const AttendanceActionRequestSchema = z
  .object({
    approvals: z.array(AttendanceActionBaseRequestSchema).min(1).max(50),
  })
  .strict();

export const AttendanceActionResultSchema = z
  .object({
    approvalStatus,
    message: z.string(),
    attendanceId: id,
    newStatus: attendanceStatusSchema,
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
