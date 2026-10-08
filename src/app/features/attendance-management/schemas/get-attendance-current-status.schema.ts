import { z } from 'zod';
import {
  AttendanceBaseSchema,
  AttendanceVehicleSchema,
} from './base-attendance.schema';
import { UserSchema, uuidField } from '@shared/schemas';

const {
  checkInTime,
  checkOutTime,
  status,
  approvalStatus,
  workDuration,
  attendanceDate,
  assignmentSnapshot,
  site,
  assignedDrivers,
} = AttendanceBaseSchema.shape;

export const AttendanceCurrentStatusGetFormSchema = z
  .object({
    employeeName: uuidField,
  })
  .strict()
  .transform(data => ({
    userId: data.employeeName,
  }));

export const AttendanceCurrentStatusGetResponseSchema = z.looseObject({
  id: uuidField.nullable(),
  attendanceDate,
  checkInTime,
  checkOutTime,
  status: status.nullable(),
  approvalStatus: approvalStatus.nullable(),
  workDuration,
  user: UserSchema.nullable(),
  site: site.optional().nullable(),
  vehicle: AttendanceVehicleSchema.optional().nullable(),
  assignedDrivers,
  assignmentSnapshot: assignmentSnapshot.optional().nullable(),
});
