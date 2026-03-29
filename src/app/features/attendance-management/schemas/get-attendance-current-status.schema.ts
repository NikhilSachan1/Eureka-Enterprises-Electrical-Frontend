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
    site: z.string().nullable(),
    company: z.string().nullable(),
    contractors: z.array(z.string()).nullable(),
    vehicle: z.string().nullable(),
    assignedEngineer: z.string().nullable(),
  })
  .strict();
