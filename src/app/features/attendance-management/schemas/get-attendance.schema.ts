import {
  FilterSchema,
  UserSchema,
  uuidField,
  dateField,
} from '@shared/schemas';
import { makeFieldsNullable, transformDateFormat } from '@shared/utility';
import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';

const {
  id,
  attendanceDate,
  checkInTime,
  checkOutTime,
  status,
  approvalStatus,
  notes,
  workDuration,
  attendanceType,
  assignmentSnapshot,
} = AttendanceBaseSchema.shape;

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const AttendanceGetRequestSchema = z
  .object({
    attendanceDate: z.array(dateField).min(1).optional(),
    employeeName: z.array(uuidField).min(1).optional(),
    attendanceStatus: z.array(status).min(1).optional(),
    approvalStatus: z.array(approvalStatus).min(1).optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .strict()
  .transform(
    ({
      attendanceDate: dateRange,
      employeeName,
      attendanceStatus,
      approvalStatus: attendanceApprovalStatus,
      ...rest
    }) => {
      const [start, end] = dateRange ?? [];

      return {
        ...rest,
        userIds: employeeName,
        statuses: attendanceStatus,
        approvalStatuses: attendanceApprovalStatus,
        startDate: transformDateFormat(start),
        endDate: transformDateFormat(end),
      };
    }
  );

export const AttendanceGetBaseResponseSchema = z
  .object({
    id,
    attendanceDate,
    checkInTime,
    checkOutTime,
    notes: notes.nullable(), // ToDo: remove this nullable after backend is updated
    workDuration,
    attendanceType,
    status,
    approvalStatus,
    user: UserSchema,
    createdBy: makeFieldsNullable(UserSchema).nullable(),
    approvalBy: makeFieldsNullable(UserSchema).nullable(),
    assignmentSnapshot: assignmentSnapshot.optional().nullable(),
  })
  .loose();

export const AttendanceGetStatsResponseSchema = z
  .object({
    attendance: z.object({
      present: z.number().int().nonnegative(),
      absent: z.number().int().nonnegative(),
      leave: z.number().int().nonnegative(),
      checkedIn: z.number().int().nonnegative(),
      checkedOut: z.number().int().nonnegative(),
      notCheckedInYet: z.number().int().nonnegative(),
      holiday: z.number().int().nonnegative(),
      total: z.number().int().nonnegative(),
    }),
    approval: z.object({
      pending: z.number().int().nonnegative(),
      approved: z.number().int().nonnegative(),
      rejected: z.number().int().nonnegative(),
      total: z.number().int().nonnegative(),
    }),
  })
  .strict();

export const AttendanceGetResponseSchema = z
  .object({
    records: z.array(AttendanceGetBaseResponseSchema),
    stats: AttendanceGetStatsResponseSchema,
    totalRecords: z.number().int().nonnegative(),
  })
  .strict();
