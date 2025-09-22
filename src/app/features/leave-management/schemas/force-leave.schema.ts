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
})
  .extend({
    userId: z.array(z.uuid()),
  })
  .strict();

export const LeaveForceResponseSchema = z.object({
  message: z.string(),
});
