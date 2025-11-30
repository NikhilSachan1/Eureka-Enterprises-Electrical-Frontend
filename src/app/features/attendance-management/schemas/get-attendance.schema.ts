import {
  FilterSchema,
  UserSchema,
  uuidField,
  dateField,
} from '@shared/schemas';
import { makeFieldsNullable, toTitleCase } from '@shared/utility';
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
} = AttendanceBaseSchema.shape;

const { sortOrder, sortField, pageSize, page, search } = FilterSchema.shape;

export const AttendanceGetRequestSchema = z
  .object({
    attendanceDate: z.array(dateField).min(1).optional(),
    userIds: z.array(uuidField).min(1).optional(),
    statuses: z.array(status).min(1).optional(),
    approvalStatuses: z.array(approvalStatus).min(1).optional(),
    sortOrder,
    sortField,
    pageSize,
    page,
    search,
  })
  .transform(({ attendanceDate: dateRange, ...rest }) => {
    if (!dateRange || dateRange.length < 1) {
      return rest;
    }

    const start = dateRange[0];
    const end = dateRange[dateRange.length - 1];

    const toISODate = (d: Date): string =>
      new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
        .toISOString()
        .split('T')[0];

    return {
      ...rest,
      startDate: toISODate(start),
      endDate: toISODate(end),
    };
  });

export const AttendanceGetBaseResponseSchema = z
  .object({
    id,
    attendanceDate,
    checkInTime,
    checkOutTime,
    notes,
    workDuration,
    status: status.transform(toTitleCase),
    approvalStatus: approvalStatus.transform(toTitleCase),
    user: UserSchema,
    createdBy: UserSchema,
    approvalBy: makeFieldsNullable(UserSchema).nullable(),
  })
  .strict();

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
