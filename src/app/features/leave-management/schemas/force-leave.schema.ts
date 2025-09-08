import { z } from 'zod';
import { LeaveBaseSchema } from './base-leave.schema';

export const LeaveForceRequestSchema = LeaveBaseSchema.pick({
  userId: true,
  leaveType: true,
  leaveCategory: true,
  fromDate: true,
  toDate: true,
  reason: true,
  approvalReason: true,
}).strict();

export const LeaveForceResponseSchema = z.object({
  message: z.string(),
});
