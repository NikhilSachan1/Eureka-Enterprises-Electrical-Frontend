import { z } from 'zod';
import { onlyDateStringField } from '@shared/schemas';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import {
  LEAVE_DAY_TYPE_DATA,
  LEAVE_TYPE_DATA,
} from '@shared/config/static-data.config';

export const LeaveApplyRequestSchema = z
  .object({
    fromDate: onlyDateStringField,
    toDate: onlyDateStringField,
    reason: z.string().trim().optional(),
    leaveType: z
      .enum(LEAVE_DAY_TYPE_DATA.map(item => item.value))
      .default(
        getMappedValueFromArrayOfObjects(
          LEAVE_DAY_TYPE_DATA,
          'FULL_DAY',
          'value',
          'value'
        )
      )
      .optional(),
    leaveCategory: z
      .enum(LEAVE_TYPE_DATA.map(item => item.value))
      .default(
        getMappedValueFromArrayOfObjects(
          LEAVE_TYPE_DATA,
          'earned',
          'value',
          'value'
        )
      )
      .optional(),
  })
  .strict();

export const LeaveApplyResponseSchema = z
  .object({
    message: z.string(),
  })
  .strict();
