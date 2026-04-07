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

export const LeaveActionResultSchema = z.looseObject({
  approvalStatus,
  message: z.string(),
  leaveApplicationId: id,
});

export const LeaveActionErrorSchema = z.looseObject({
  leaveApplicationId: id,
  error: z.string().min(1),
});

export const LeaveActionResponseSchema = z.looseObject({
  message: z.string().min(1),
  result: z.array(LeaveActionResultSchema),
  errors: z.array(LeaveActionErrorSchema),
});
