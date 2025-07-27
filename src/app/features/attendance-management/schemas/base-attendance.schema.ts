import { AuditSchema } from '@shared/schemas';
import { z } from 'zod';

export const AttendanceBaseSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    attendanceDate: z.string(),
    checkInTime: z.string(),
    checkOutTime: z.string().nullable(),
    status: z.enum(['present', 'absent', 'leave', 'holiday']),
    shiftConfigId: z.string().uuid(),
    entrySourceType: z.enum(['web', 'mobile']),
    attendanceType: z.enum(['regularized', 'self', 'forced']),
    regularizedBy: z.string().uuid().nullable(),
    approvalStatus: z.enum(['pending', 'approved', 'rejected']),
    approvalBy: z.string().uuid().nullable(),
    approvalAt: z.string().nullable(),
    approvalComment: z.string().nullable(),
    notes: z.string(),
    isActive: z.boolean(),
  })
  .merge(AuditSchema)
  .strict();
