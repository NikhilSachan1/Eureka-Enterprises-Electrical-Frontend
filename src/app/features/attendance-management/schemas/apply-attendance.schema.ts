import { z } from 'zod';
import { AttendanceBaseSchema } from './base-attendance.schema';
import { EApplyAttendanceAction } from '../types/attendance.enum';

const { checkInTime } = AttendanceBaseSchema.shape;

export const AttendanceApplyRequestSchema = z
  .object({
    locationName: z.string(),
    clientName: z.string(),
    associateEngineerName: z.string(),
    associatedVehicle: z.string(),
  })
  .transform(data => ({
    notes: `${data.clientName} - ${data.locationName}`,
    action: EApplyAttendanceAction.CHECK_IN,
  }));

export const AttendanceApplyResponseSchema = z.object({
  checkInTime,
  message: z.string(),
});
