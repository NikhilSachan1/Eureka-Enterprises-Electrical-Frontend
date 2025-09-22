import { z } from 'zod';
import { LeaveBaseSchema } from './base-leave.schema';

const { id, reason } = LeaveBaseSchema.shape;

export const LeaveActionBaseRequestSchema = LeaveBaseSchema.pick({
  approvalStatus: true,
})
  .extend({
    leaveApplicationId: id,
    approvalComment: reason,
    attendanceStatus: z.enum(['present', 'absent']).optional(),
  })
  .strict();

export const LeaveActionRequestSchema = z
  .object({
    approvals: z.array(LeaveActionBaseRequestSchema),
  })
  .strict();

export const LeaveActionResultSchema = LeaveBaseSchema.pick({
  approvalStatus: true,
})
  .extend({
    message: z.string(),
    leaveApplicationId: id,
  })
  .strict();

export const LeaveErrorSchema = z.object({
  leaveApplicationId: id,
  error: z.string(),
});

export const LeaveActionResponseSchema = z
  .object({
    message: z.string(),
    result: z.array(LeaveActionResultSchema),
    errors: z.array(LeaveErrorSchema),
  })
  .strict();
