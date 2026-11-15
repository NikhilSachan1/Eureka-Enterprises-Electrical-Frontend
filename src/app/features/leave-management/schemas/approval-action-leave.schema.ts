import * as z from 'zod';
import { LeaveBaseSchema } from './base-leave.schema';

const { id, approvalStatus, approvalReason } = LeaveBaseSchema.shape;

export const LeaveActionRequestSchema = z
  .object({
    approvalStatus,
    remark: approvalReason,
    leaveIds: z.array(id),
    attendanceStatus: z.string().optional().nullable(),
    /** Days not started yet: the API refuses an attendance status for them. */
    futureLeaveIds: z.array(id).optional(),
  })
  .strict()
  .transform(data => {
    return {
      approvals: data.leaveIds.map(leaveId => ({
        leaveApplicationId: leaveId,
        approvalStatus: data.approvalStatus,
        approvalComment: data.remark,
        attendanceStatus: data.futureLeaveIds?.includes(leaveId)
          ? undefined
          : data.attendanceStatus,
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
