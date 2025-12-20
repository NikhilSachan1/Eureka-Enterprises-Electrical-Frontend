import { z } from 'zod';
import { LeaveBaseSchema } from './base-leave.schema';
import { attendanceStatusSchema } from '@features/attendance-management/schemas/base-attendance.schema';

const { id, approvalStatus, approvalReason } = LeaveBaseSchema.shape;

export const LeaveActionBaseRequestSchema = z
  .object({
    approvalStatus,
    approvalComment: approvalReason,
    leaveApplicationId: id,
    attendanceStatus: attendanceStatusSchema.optional(),
  })
  .strict();

export const LeaveActionRequestSchema = z
  .object({
    approvals: z.array(LeaveActionBaseRequestSchema).min(1).max(50),
  })
  .strict();

export const LeaveActionResultSchema = z
  .object({
    approvalStatus,
    message: z.string(),
    leaveApplicationId: id,
  })
  .strict();

export const LeaveActionErrorSchema = z
  .object({
    leaveApplicationId: id,
    error: z.string().min(1),
  })
  .strict();

export const LeaveActionResponseSchema = z
  .object({
    message: z.string().min(1),
    result: z.array(LeaveActionResultSchema),
    errors: z.array(LeaveActionErrorSchema),
  })
  .strict();
