import { z } from 'zod';
import { LeaveBaseSchema } from './base-leave.schema';

const { id, approvalStatus, approvalReason } = LeaveBaseSchema.shape;

export const LeaveActionRequestSchema = z
  .object({
    approvalStatus,
    remark: approvalReason,
    leaveIds: z.array(id),
    attendanceStatus: z.string().optional().nullable(),
  })
  .strict()
  .transform(data => {
    return {
      approvals: data.leaveIds.map(leaveId => ({
        leaveApplicationId: leaveId,
        approvalStatus: data.approvalStatus,
        approvalComment: data.remark,
        attendanceStatus: data.attendanceStatus,
      })),
    };
  });

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
