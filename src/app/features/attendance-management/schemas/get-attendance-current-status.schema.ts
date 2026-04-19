import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';
import { UserSchema, uuidField } from '@shared/schemas';

const {
  checkInTime,
  checkOutTime,
  status,
  approvalStatus,
  workDuration,
  attendanceDate,
  assignmentSnapshot,
} = AttendanceBaseSchema.shape;

const assignmentSnapshotShape = assignmentSnapshot.unwrap().shape;

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
  user: UserSchema,
  ...assignmentSnapshotShape,
});
