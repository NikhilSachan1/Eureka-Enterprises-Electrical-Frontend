import { AuditSchema } from '@shared/schemas';
import { z } from 'zod';
import { EAttendanceStatus } from '../types/attendance.enum';

export const AttendanceBaseSchema = z
  .object({
    id: z.uuid(),
    userId: z.uuid(),
    attendanceDate: z.string(),
    checkInTime: z.string().nullable(),
    checkOutTime: z.string().nullable(),
    status: z.enum(Object.values(EAttendanceStatus)),
    shiftConfigId: z.uuid(),
    entrySourceType: z.enum(['web', 'mobile']),
    attendanceType: z.enum(['regularized', 'self', 'forced']),
    regularizedBy: z.uuid().nullable(),
    approvalStatus: z.enum(['pending', 'approved', 'rejected']),
    approvalBy: z.uuid().nullable(),
    approvalAt: z.string().nullable(),
    approvalComment: z.string().nullable(),
    notes: z.string(),
    isActive: z.boolean(),
    workDuration: z.number().optional(),
  })
  .merge(AuditSchema)
  .strict();
