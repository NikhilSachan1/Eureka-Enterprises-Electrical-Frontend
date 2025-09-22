import { z } from 'zod';
import { LeaveBaseSchema } from './base-leave.schema';
import { FilterSchema, UserSchema } from '@shared/schemas';
import { toTitleCase } from '@shared/utility';

const { userId, approvalStatus, leaveType } = LeaveBaseSchema.shape;

export const LeaveGetRequestSchema = z
  .object({
    userIds: z.array(userId).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    approvalStatuses: z.array(approvalStatus).optional(),
    leaveTypes: z.array(leaveType).optional(),
    financialYear: z.string(),
  })
  .merge(
    FilterSchema.pick({
      sortOrder: true,
      sortField: true,
      pageSize: true,
      page: true,
      search: true,
    })
  )
  .strict();

export const LeaveGetBaseResponseSchema = LeaveBaseSchema.extend({
  user: UserSchema.partial(),
  approvalByUser: UserSchema.partial().nullable(),
  createdByUser: UserSchema.partial(),
  approvalStatus: approvalStatus.transform(leaveApprovalStatus =>
    toTitleCase(leaveApprovalStatus)
  ),
}).strict();

export const LeaveGetStatsResponseSchema = z.object({
  approval: z.object({
    total: z.number(),
    pending: z.number(),
    approved: z.number(),
    rejected: z.number(),
    cancelled: z.number(),
  }),
  leaveBalance: z.object({
    totalCredited: z.number(),
    totalConsumed: z.number(),
    totalBalance: z.number(),
  }),
});

export const LeaveGetResponseSchema = z.object({
  records: z.array(LeaveGetBaseResponseSchema),
  stats: LeaveGetStatsResponseSchema,
  totalRecords: z.number(),
});
