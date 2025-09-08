import { z } from 'zod';
import { LeaveBaseSchema } from './base-leave.schema';

export const LeaveApplyRequestSchema = LeaveBaseSchema.pick({
  leaveType: true,
  leaveCategory: true,
  fromDate: true,
  toDate: true,
  reason: true,
}).strict();

export const LeaveApplyResponseSchema = z.object({
  message: z.string(),
});
