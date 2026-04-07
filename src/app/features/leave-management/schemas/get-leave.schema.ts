import { dateField, FilterSchema, uuidField } from '@shared/schemas';
import z from 'zod';
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
    grouped: z.boolean().default(false),
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

export const LeaveGetResponseSchema = z.looseObject({
  records: z.array(LeaveGetBaseResponseSchema),
  stats: LeaveGetStatsResponseSchema,
  totalRecords: z.number().int().nonnegative(),
});
