import { z } from 'zod';
import { onlyDateStringField } from '@shared/schemas';
import { ELeaveCategory, ELeaveDayType } from '../types/leave.type';

export const LeaveApplyRequestSchema = z
  .object({
    fromDate: onlyDateStringField,
    toDate: onlyDateStringField,
    reason: z.string().trim().optional(),
    leaveType: z.string().min(1).default(ELeaveDayType.FULL_DAY).optional(),
    leaveCategory: z.string().min(1).default(ELeaveCategory.EARNED).optional(),
  })
  .strict();

export const LeaveApplyResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
