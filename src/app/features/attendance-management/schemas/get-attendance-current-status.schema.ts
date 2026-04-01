import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';
import { UserSchema, uuidField } from '@shared/schemas';

const {
  id,
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

export const AttendanceCurrentStatusGetResponseSchema = z
  .object({
    id,
    attendanceDate,
    checkInTime,
    checkOutTime,
    status,
    approvalStatus,
    workDuration,
    user: UserSchema,
    ...assignmentSnapshotShape,
  })
  .loose();
