import { FilterSchema, UserSchema } from '@shared/schemas';
import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';
import { toTitleCase } from '@shared/utility';

const { userId, status, approvalStatus } = AttendanceBaseSchema.shape;

export const AttendanceGetRequestSchema = z
  .object({
    startDate: z.string(),
    endDate: z.string(),
    userIds: z.array(userId).optional(),
    status: z.array(status).optional(),
    approvalStatus: z.array(approvalStatus).optional(),
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

export const AttendanceGetBaseResponseSchema = AttendanceBaseSchema.pick({
  id: true,
  attendanceDate: true,
  checkInTime: true,
  checkOutTime: true,
  status: true,
  approvalStatus: true,
  notes: true,
})
  .extend({
    workDuration: z.number(),
    status: status.transform(attendanceStatus => toTitleCase(attendanceStatus)),
    approvalStatus: approvalStatus.transform(attendanceApprovalStatus =>
      toTitleCase(attendanceApprovalStatus)
    ),
    user: UserSchema,
    createdBy: UserSchema,
    approvalBy: UserSchema,
  })
  .strict();

export const AttendanceGetStatsResponseSchema = z
  .object({
    attendance: z.object({
      present: z.number(),
      absent: z.number(),
      leave: z.number(),
      checkedIn: z.number(),
      checkedOut: z.number(),
      notCheckedInYet: z.number(),
      holiday: z.number(),
      total: z.number(),
    }),
    approval: z.object({
      pending: z.number(),
      approved: z.number(),
      rejected: z.number(),
      total: z.number(),
    }),
  })
  .strict();

export const AttendanceGetResponseSchema = z
  .object({
    records: z.array(AttendanceGetBaseResponseSchema),
    stats: AttendanceGetStatsResponseSchema,
    totalRecords: z.number(),
  })
  .strict();
