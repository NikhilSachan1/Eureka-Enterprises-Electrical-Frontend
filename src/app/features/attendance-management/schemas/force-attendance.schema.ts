import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';
import { dateField } from '@shared/schemas/common.schema';
import { SHIFT_DATA } from '@shared/config/static-data.config';
import { transformDateFormat } from '@shared/utility';

const { notes, status, id } = AttendanceBaseSchema.shape;

const AssignmentSnapshotSchema = z
  .object({
    site: z.record(z.string(), z.unknown()),
    company: z.record(z.string(), z.unknown()),
    contractors: z.array(z.record(z.string(), z.unknown())),
    vehicle: z.record(z.string(), z.unknown()),
    assignedEngineer: z.record(z.string(), z.unknown()),
  })
  .optional();

export const AttendanceForceRequestSchema = z
  .object({
    employeeName: id,
    attendanceDate: dateField,
    attendanceStatus: status,
    clientName: z.string().nullable(),
    locationName: z.string().nullable(),
    associateEngineerName: z.string().nullable(),
    associatedVehicle: z.string().nullable(),
    remark: notes,
    assignmentSnapshot: AssignmentSnapshotSchema.nullable(),
  })
  .strict()
  .transform(data => ({
    userIds: data.employeeName,
    attendanceDate: transformDateFormat(data.attendanceDate),
    notes: data.remark,
    reason: data.remark,
    status: data.attendanceStatus,
    checkInTime: SHIFT_DATA.START_TIME,
    checkOutTime: SHIFT_DATA.END_TIME,
    // assignmentSnapshot: data.assignmentSnapshot ?? {
    //   site: {},
    //   company: {},
    //   contractors: [],
    //   vehicle: {},
    //   assignedEngineer: {},
    // },
  }));

export const AttendanceForceResponseSchema = z
  .object({
    message: z.string().min(1),
  })
  .strict();
