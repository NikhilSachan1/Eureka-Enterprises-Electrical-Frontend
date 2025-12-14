import {
  LeaveApplyRequestSchema,
  LeaveApplyResponseSchema,
} from './apply-leave.schema';
import { uuidField } from '@shared/schemas';
import { z } from 'zod';

export const LeaveForceRequestSchema = LeaveApplyRequestSchema.extend({
  userId: uuidField,
  approvalReason: z.string().trim(),
});

export const LeaveForceResponseSchema = LeaveApplyResponseSchema.strict();
