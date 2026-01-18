import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';
import { UserSchema } from '@shared/schemas';

const { id, checkInTime, checkOutTime, status, approvalStatus, workDuration } =
  AttendanceBaseSchema.shape;

export const AttendanceCurrentStatusGetResponseSchema = z
  .object({
    id,
    checkInTime,
    checkOutTime,
    status,
    approvalStatus,
    workDuration,
    location: z.string(),
    clientName: z.string(),
    associateEmployeeName: z.string().nullable().optional(), // TODO: Remove optional once we have the associate employee name
    user: UserSchema,
  })
  .strict();
