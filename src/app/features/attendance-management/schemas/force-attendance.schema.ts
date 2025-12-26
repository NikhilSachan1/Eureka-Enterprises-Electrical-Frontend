import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';
import { uuidField } from '@shared/schemas';
import {
  onlyDateStringField,
  onlyTimeStringField,
} from '@shared/schemas/common.schema';
import { SHIFT_DATA } from '@shared/config/static-data.config';

const { notes, status } = AttendanceBaseSchema.shape;

export const AttendanceForceRequestSchema = z
  .object({
    attendanceDate: onlyDateStringField,
    checkInTime: onlyTimeStringField.default(SHIFT_DATA.START_TIME).optional(),
    checkOutTime: onlyTimeStringField.default(SHIFT_DATA.END_TIME).optional(),
    notes,
    status,
    userIds: z.array(uuidField).min(1).max(100),
    reason: z.string(),
    timezone: z.string(),
  })
  .strict();

export const AttendanceForceResponseSchema = z
  .object({
    message: z.string().min(1),
  })
  .strict();
