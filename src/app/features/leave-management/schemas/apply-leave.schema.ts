import { z } from 'zod';
import { onlyDateStringField } from '@shared/schemas';
import { LeaveBaseSchema } from './base-leave.schema';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import {
  LEAVE_DAY_TYPE_DATA,
  LEAVE_TYPE_DATA,
} from '@shared/config/static-data.config';

const { leaveType, leaveCategory, reason } = LeaveBaseSchema.shape;

export const LeaveApplyRequestSchema = z
  .object({
    leaveType: leaveType.default(
      getMappedValueFromArrayOfObjects(
        LEAVE_DAY_TYPE_DATA,
        'FULL_DAY',
        'value',
        'value'
      )
    ),
    leaveCategory: leaveCategory.default(
      getMappedValueFromArrayOfObjects(
        LEAVE_TYPE_DATA,
        'earned',
        'value',
        'value'
      )
    ),
    fromDate: onlyDateStringField,
    toDate: onlyDateStringField,
    reason,
  })
  .strict();

export const LeaveApplyResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
