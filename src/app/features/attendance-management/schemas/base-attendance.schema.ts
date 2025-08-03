import { AuditSchema } from '@shared/schemas';
import { z } from 'zod';

export const AttendanceBaseSchema = z
  .object({
    id: z.uuid(),
    userId: z.uuid(),
    attendanceDate: z.string(),
    checkInTime: z.string(),
    checkOutTime: z.string().nullable(),
    status: z.enum(['present', 'absent', 'leave', 'holiday']),
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
    workDuration: z.number(),
  })
  .merge(AuditSchema)
  .strict();
