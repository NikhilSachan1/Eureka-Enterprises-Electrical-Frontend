import { z } from 'zod';
import { ELeaveDayType, ELeaveType } from '../types/leave.enum';
import { AuditSchema } from '@shared/schemas';

export const LeaveBaseSchema = z
  .object({
    id: z.uuid(),
    userId: z.uuid(),
    leaveType: z.enum(ELeaveDayType),
    leaveCategory: z.enum(ELeaveType),
    fromDate: z.string(),
    toDate: z.string(),
    reason: z.string(),
    approvalStatus: z.enum(['pending', 'approved', 'rejected', 'cancelled']),
    leaveApplicationType: z.enum(['self', 'forced']),
    approvalBy: z.uuid().nullable(),
    approvalAt: z.string().nullable(),
    approvalReason: z.string().nullable(),
    entrySourceType: z.enum(['web', 'mobile']),
  })
  .merge(
    AuditSchema.pick({
      createdBy: true,
      createdAt: true,
      updatedAt: true,
    })
  )
  .strict();
