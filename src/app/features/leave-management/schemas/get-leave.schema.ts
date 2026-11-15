import { dateField, FilterSchema, uuidField } from '@shared/schemas';
import * as z from 'zod';
import { LeaveBaseSchema } from './base-leave.schema';
import { FinancialYearService } from '@core/services/financial-year.service';
import { toTitleCase, transformDateFormat } from '@shared/utility';

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;
const { approvalStatus } = LeaveBaseSchema.shape;

export const LeaveGetRequestSchema = z
  .object({
    leaveDate: z.array(dateField).min(1).optional(),
    employeeName: z.array(uuidField).min(1).optional(),
    approvalStatus: z.array(approvalStatus).optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(
    ({
      leaveDate: dateRange,
      employeeName,
      approvalStatus: leaveApprovalStatus,
      ...rest
    }) => {
      const [fromDate, toDate] = dateRange ?? [];
      return {
        ...rest,
        userIds: employeeName,
        approvalStatuses: leaveApprovalStatus,
        financialYear: new FinancialYearService().getFinancialYear(),
        startDate: transformDateFormat(fromDate),
        endDate: transformDateFormat(toDate),
      };
    }
  );

export const LeaveGetBaseResponseSchema = z.looseObject({
  ...LeaveBaseSchema.shape,
  approvalStatus: approvalStatus.transform(toTitleCase),
});

export const LeaveGetStatsResponseSchema = z.looseObject({
  leaveBalance: z.object({
    totalCredited: z.number().nonnegative(),
    totalConsumed: z.number().nonnegative(),
    totalBalance: z.number().nonnegative(),
  }),
  approval: z.object({
    pending: z.number().int().nonnegative(),
    approved: z.number().int().nonnegative(),
    rejected: z.number().int().nonnegative(),
    cancelled: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
  }),
});

const LeaveDayCountSchema = z.number().int().nonnegative();

/** One leave submission (apply / force): its days, each with its own approval status. */
export const LeaveGroupGetBaseResponseSchema = z.looseObject({
  groupId: uuidField,
  userId: uuidField,
  user: LeaveBaseSchema.shape.user,
  leaveType: LeaveBaseSchema.shape.leaveType,
  leaveCategory: LeaveBaseSchema.shape.leaveCategory,
  leaveApplicationType: LeaveBaseSchema.shape.leaveApplicationType,
  reason: LeaveBaseSchema.shape.reason,
  fromDate: LeaveBaseSchema.shape.fromDate,
  toDate: LeaveBaseSchema.shape.toDate,
  dayCount: z.number().int().positive(),
  /** Status of every day, or "mixed" when the days differ. */
  approvalStatus: z.string(),
  statusCounts: z.object({
    pending: LeaveDayCountSchema,
    approved: LeaveDayCountSchema,
    rejected: LeaveDayCountSchema,
    cancelled: LeaveDayCountSchema,
  }),
  createdAt: LeaveBaseSchema.shape.createdAt,
  createdByUser: LeaveBaseSchema.shape.createdByUser,
  records: z.array(LeaveGetBaseResponseSchema).min(1),
});

export const LeaveGroupGetResponseSchema = z.looseObject({
  records: z.array(LeaveGroupGetBaseResponseSchema),
  stats: LeaveGetStatsResponseSchema,
  totalRecords: z.number().int().nonnegative(),
});
