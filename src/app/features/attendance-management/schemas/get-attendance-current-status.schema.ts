import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';
import { UserSchema } from '@shared/schemas';

const {
  id,
  checkInTime,
  checkOutTime,
  status,
  approvalStatus,
  workDuration,
  attendanceDate,
} = AttendanceBaseSchema.shape;

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
    location: z.string(),
    clientName: z.string(),
    associateEmployeeName: z.string().nullable().optional(), // TODO: Remove optional once we have the associate employee name
  })
  .strict();
